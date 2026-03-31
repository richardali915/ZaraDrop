// src/hooks/useOrders.js
// Production-grade orders hook.
// • Optimistic UI updates on status changes
// • Realtime with reconnect fallback polling
// • Smart data fetching — minimal columns on list, full on demand
// • All role methods: customer cancelOrder, rider riderCancelJob

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, callFn } from '../lib/supabase';

const POLL_INTERVAL_MS = 30_000; // fallback if realtime drops

// Full select used for orders list
const ORDER_SELECT = `
  id, order_code, status, created_at, updated_at,
  subtotal, delivery_fee, service_fee, total, rider_earn,
  payment_method, payment_status, zp_earned,
  delivery_address, customer_phone, notes, eta,
  order_items(id, name, price, quantity, subtotal, menu_item_id),
  stores(id, name, logo, location, address, phone),
  rider_profiles(id, rider_id, vehicle, rating, profiles(name, phone))
`;

export function useOrders(userId, role, storeId) {
  const [orders,       setOrders]      = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState(null);
  const [actionLoading,setActLoading]  = useState(null); // orderId being acted on

  const pollTimer    = useRef(null);
  const mounted      = useRef(true);
  const realtimeFail = useRef(false);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(pollTimer.current); }; }, []);

  // ── Fetch orders ───────────────────────────────────────────
  const fetchOrders = useCallback(async ({ silent = false } = {}) => {
    if (!userId) return;
    if (!silent && mounted.current) setLoading(true);

    try {
      let q = supabase.from('orders').select(ORDER_SELECT)
        .order('created_at', { ascending: false });

      if (role === 'customer')              q = q.eq('customer_id', userId);
      else if (role === 'rider')            q = q.eq('rider_id', userId);
      else if (role === 'store' && storeId) q = q.eq('store_id', storeId);
      else return;

      const { data, error: qErr } = await q;
      if (qErr) throw qErr;
      if (mounted.current) setOrders(data ?? []);
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      if (mounted.current && !silent) setLoading(false);
    }
  }, [userId, role, storeId]);

  // ── Fetch unassigned jobs (rider job board) ────────────────
  const fetchAvailableJobs = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, order_code, status, created_at, total, delivery_fee, rider_earn,
        delivery_address, customer_phone,
        order_items(name, quantity),
        stores(id, name, logo, address, location, phone)
      `)
      .eq('status', 'ready')
      .is('rider_id', null)
      .order('created_at', { ascending: true })
      .limit(30);
    return data ?? [];
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Realtime subscription with fallback polling ────────────
  useEffect(() => {
    if (!userId) return;

    let filter = '';
    if (role === 'customer')              filter = `customer_id=eq.${userId}`;
    else if (role === 'rider')            filter = `rider_id=eq.${userId}`;
    else if (role === 'store' && storeId) filter = `store_id=eq.${storeId}`;
    else return;

    const ch = supabase.channel(`orders_${userId}_${role}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter }, (p) => {
        realtimeFail.current = false;
        if (!mounted.current) return;

        setOrders((prev) => {
          switch (p.eventType) {
            case 'INSERT': return [p.new, ...prev];
            case 'UPDATE': return prev.map(o => o.id === p.new.id
              ? { ...o, ...p.new } : o);
            case 'DELETE': return prev.filter(o => o.id !== p.old?.id);
            default: return prev;
          }
        });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          realtimeFail.current = true;
          // Fall back to polling
          pollTimer.current = setInterval(() => {
            if (mounted.current) fetchOrders({ silent: true });
          }, POLL_INTERVAL_MS);
        }
      });

    return () => {
      supabase.removeChannel(ch);
      clearInterval(pollTimer.current);
    };
  }, [userId, role, storeId, fetchOrders]);

  // ── Helpers ────────────────────────────────────────────────
  const withLoading = async (orderId, fn) => {
    setActLoading(orderId);
    setError(null);
    try {
      const res = await fn();
      return res;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      if (mounted.current) setActLoading(null);
    }
  };

  // Optimistic status update — shows the change immediately, reverts on error
  const _optimisticStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };
  const _revertStatus = (orderId, prevStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: prevStatus } : o));
  };

  // ── Place order ────────────────────────────────────────────
  const placeOrder = useCallback(async (payload) => {
    return callFn('place-order', {
      store_id:         payload.store_id,
      items:            payload.items,
      delivery_address: payload.delivery_address,
      customer_phone:   payload.customer_phone,
      payment_method:   payload.payment_method || 'wallet',
      use_zp_points:    !!payload.use_zp_points,
    });
  }, []);

  // ── Cancel order (customer) ────────────────────────────────
  const cancelOrder = useCallback(async (orderId, reason = 'Changed my mind') => {
    const prev = orders.find(o => o.id === orderId);
    if (!prev) throw new Error('Order not found');

    const CANCELLABLE = ['pending', 'confirmed', 'preparing'];
    if (!CANCELLABLE.includes(prev.status)) {
      throw new Error(`Cannot cancel — order is already ${prev.status}`);
    }

    return withLoading(orderId, async () => {
      _optimisticStatus(orderId, 'cancelled');
      try {
        return await callFn('cancel-order', {
          order_id:      orderId,
          reason,
          cancelled_by: 'customer',
        });
      } catch (e) {
        _revertStatus(orderId, prev.status);
        throw e;
      }
    });
  }, [orders]);

  // ── Rider cancels job ──────────────────────────────────────
  const riderCancelJob = useCallback(async (orderId, reason = 'Unable to complete') => {
    return withLoading(orderId, () =>
      callFn('cancel-order', { order_id: orderId, reason, cancelled_by: 'rider' })
    );
  }, []);

  // ── Store marks order ready ────────────────────────────────
  const markReady = useCallback(async (orderId, attendantId) => {
    return withLoading(orderId, async () => {
      _optimisticStatus(orderId, 'ready');
      const { error: e } = await supabase.from('orders')
        .update({ status: 'ready', attendant_id: attendantId || null })
        .eq('id', orderId);
      if (e) { _revertStatus(orderId, 'preparing'); throw e; }
    });
  }, []);

  // ── Rider grabs job (atomic) ──────────────────────────────
  const grabJob = useCallback(async (orderId) =>
    callFn('assign-rider', { order_id: orderId }),
  []);

  // ── Advance delivery step (optimistic) ───────────────────
  const advanceDelivery = useCallback(async (orderId, nextStatus) => {
    const prev = orders.find(o => o.id === orderId);
    _optimisticStatus(orderId, nextStatus);
    const { error: e } = await supabase.from('orders')
      .update({ status: nextStatus }).eq('id', orderId);
    if (e) { _revertStatus(orderId, prev?.status || nextStatus); throw e; }
  }, [orders]);

  // ── Complete delivery (verify code) ──────────────────────
  const completeDelivery = useCallback(async (orderId, orderCode) =>
    withLoading(orderId, () =>
      callFn('complete-delivery', { order_id: orderId, order_code: orderCode })
    ),
  []);

  // ── Computed helpers ──────────────────────────────────────
  const activeOrders  = orders.filter(o => !['delivered','cancelled'].includes(o.status));
  const pastOrders    = orders.filter(o =>  ['delivered','cancelled'].includes(o.status));
  const pendingCount  = orders.filter(o => o.status === 'pending').length;

  return {
    orders, activeOrders, pastOrders, pendingCount,
    loading, error, actionLoading,
    refresh: fetchOrders,
    fetchAvailableJobs,
    placeOrder, cancelOrder, riderCancelJob,
    markReady, grabJob, advanceDelivery, completeDelivery,
  };
}