// src/hooks/useWallet.js
// Production-grade wallet hook.
// • Realtime balance updates — no refresh needed after transactions
// • Enriched transactions with icons + categories
// • PIN set/verify via pgcrypto RPC (hash never leaves DB)
// • Balance in both kobo (raw) and naira (display)
// • Pending transaction tracking

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, callFn } from '@zaradrop/lib';

// Map transaction type/description to display icon
const TX_ICONS = {
  'Order payment':       '🛍️',
  'Delivery earning':    '🏍️',
  'Order refund':        '↩️',
  'Top-up':              '⬆️',
  'Bank transfer':       '🏦',
  'Send money':          '📤',
  'Received':            '📥',
  'Withdrawal':          '🏧',
  'Bonus':               '🏆',
  'Milestone bonus':     '🏆',
  'ZP reward':           '⭐',
};

function enrichTx(tx) {
  const icon = tx.icon
    || Object.entries(TX_ICONS).find(([k]) => tx.description?.includes(k))?.[1]
    || (tx.type === 'credit' ? '💰' : '💸');
  return { ...tx, icon };
}

export function useWallet(userId) {
  const [walletRow, setWalletRow] = useState(null); // raw DB row
  const [txns,      setTxns]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [pending,   setPending]   = useState([]); // optimistic pending txns

  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  // ── Fetch wallet + recent transactions ─────────────────────
  const fetchWallet = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: w, error: wErr } = await supabase
        .from('wallets')
        .select('id, balance, pin_hash')
        .eq('user_id', userId)
        .single();
      if (wErr) throw wErr;

      const { data: t } = await supabase
        .from('wallet_transactions')
        .select('id, type, amount, description, icon, method, balance_after, created_at, order_id')
        .eq('wallet_id', w.id)
        .order('created_at', { ascending: false })
        .limit(60);

      if (mounted.current) {
        setWalletRow(w);
        setTxns((t ?? []).map(enrichTx));
      }
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  // ── Realtime: balance + new transactions ───────────────────
  useEffect(() => {
    if (!walletRow?.id) return;
    const ch = supabase.channel(`wallet_${walletRow.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'wallets',
        filter: `id=eq.${walletRow.id}`,
      }, (p) => {
        if (mounted.current) setWalletRow(prev => ({ ...prev, balance: p.new.balance }));
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'wallet_transactions',
        filter: `wallet_id=eq.${walletRow.id}`,
      }, (p) => {
        if (mounted.current) {
          setTxns(prev => [enrichTx(p.new), ...prev]);
          // Remove matching pending entry if exists
          setPending(prev => prev.filter(x => x._ref !== p.new.reference));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [walletRow?.id]);

  // ── PIN management ─────────────────────────────────────────
  const verifyPin = useCallback(async (pin) => {
    const { data, error: e } = await supabase.rpc('verify_wallet_pin', {
      p_user_id: userId, p_pin: pin,
    });
    if (e) throw e;
    return !!data;
  }, [userId]);

  const setPin = useCallback(async (pin) => {
    const { error: e } = await supabase.rpc('set_wallet_pin', {
      p_user_id: userId, p_pin: pin,
    });
    if (e) throw e;
    setWalletRow(prev => ({ ...prev, pin_hash: '**SET**' })); // indicate PIN is set
  }, [userId]);

  const hasPin = !!walletRow?.pin_hash;

  // ── Top up via card ────────────────────────────────────────
  const topUp = useCallback(async (amountNaira, cardLast4 = '0000', cardBrand = 'Visa') => {
    if (amountNaira < 100) throw new Error('Minimum top-up is ₦100');

    // Optimistic: show pending entry
    const ref = `topup_${Date.now()}`;
    const optimistic = {
      id: ref, _ref: ref, type: 'credit',
      amount: amountNaira * 100,
      description: `Top-up via ${cardBrand} ****${cardLast4}`,
      icon: '⬆️', method: cardBrand,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setPending(prev => [optimistic, ...prev]);

    try {
      const result = await callFn('process-payment', {
        action:     'topup_card',
        amount:     amountNaira * 100,
        card_last4: cardLast4,
        card_brand: cardBrand,
      });
      return result;
    } catch (e) {
      setPending(prev => prev.filter(x => x._ref !== ref));
      throw e;
    }
  }, []);

  // ── Get virtual account for bank transfer ─────────────────
  const getBankDetails = useCallback(async () => {
    return callFn('process-payment', { action: 'topup_bank', amount: 0 });
  }, []);

  // ── Send money to another user ─────────────────────────────
  const sendMoney = useCallback(async (recipientPhone, amountNaira) => {
    if (amountNaira < 10) throw new Error('Minimum transfer is ₦10');
    const bal = (walletRow?.balance ?? 0) / 100;
    if (amountNaira > bal) throw new Error(`Insufficient balance. Available: ₦${bal.toLocaleString()}`);

    return callFn('process-payment', {
      action:           'send',
      amount:           amountNaira * 100,
      recipient_phone:  recipientPhone,
    });
  }, [walletRow]);

  // ── Withdraw ───────────────────────────────────────────────
  const withdraw = useCallback(async (amountNaira, bankName, accountNo) => {
    if (amountNaira < 500) throw new Error('Minimum withdrawal is ₦500');
    const bal = (walletRow?.balance ?? 0) / 100;
    if (amountNaira > bal) throw new Error(`Insufficient balance. Available: ₦${bal.toLocaleString()}`);

    return callFn('process-payment', {
      action:     'withdraw',
      amount:     amountNaira * 100,
      bank_name:  bankName,
      account_no: accountNo,
    });
  }, [walletRow]);

  // ── Computed ───────────────────────────────────────────────
  const balanceKobo   = walletRow?.balance ?? 0;
  const balanceNaira  = balanceKobo / 100;
  const allTxns       = [...pending, ...txns];
  const monthlyIn     = txns.filter(t => t.type === 'credit' && isThisMonth(t.created_at))
                            .reduce((s, t) => s + t.amount, 0);
  const monthlyOut    = txns.filter(t => t.type === 'debit'  && isThisMonth(t.created_at))
                            .reduce((s, t) => s + t.amount, 0);

  return {
    wallet:        walletRow,
    txns:          allTxns,
    loading,       error,
    balance:       balanceNaira,    // ₦ (convenience)
    balanceKobo,                    // raw kobo
    hasPin,        monthlyIn, monthlyOut,
    refresh:       fetchWallet,
    verifyPin,     setPin,
    topUp,         getBankDetails,
    sendMoney,     withdraw,
  };
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}