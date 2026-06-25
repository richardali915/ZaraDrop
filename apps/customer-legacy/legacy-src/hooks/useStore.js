// src/hooks/useStore.js
// Production-grade store owner hook.
// • Realtime menu stock + availability updates
// • Attendant PIN management via pgcrypto
// • Session recording per attendant
// • Store analytics with chart-ready data

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@zaradrop/lib';

export function useStore(userId) {
  const [store,      setStore]      = useState(null);
  const [menu,       setMenu]       = useState([]);
  const [attendants, setAttendants] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  // ── Fetch all store data ───────────────────────────────────
  const fetchStore = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: s, error: sErr } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (sErr && sErr.code !== 'PGRST116') throw sErr;
      if (!mounted.current) return;
      setStore(s ?? null);

      if (s) {
        const [{ data: items }, { data: atts }] = await Promise.all([
          supabase.from('menu_items')
            .select('*')
            .eq('store_id', s.id)
            .order('is_popular', { ascending: false })
            .order('created_at'),
          supabase.from('store_attendants')
            .select('*')
            .eq('store_id', s.id)
            .order('created_at'),
        ]);
        if (mounted.current) {
          setMenu(items ?? []);
          setAttendants(atts ?? []);
        }
      }
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  // ── Realtime: menu item updates (stock / availability) ────
  useEffect(() => {
    if (!store?.id) return;
    const ch = supabase.channel(`store_menu_rt_${store.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'menu_items',
        filter: `store_id=eq.${store.id}`,
      }, (p) => {
        if (!mounted.current) return;
        if (p.eventType === 'INSERT') {
          setMenu(prev => [...prev, p.new]);
        } else if (p.eventType === 'UPDATE') {
          setMenu(prev => prev.map(m => m.id === p.new.id ? { ...m, ...p.new } : m));
        } else if (p.eventType === 'DELETE') {
          setMenu(prev => prev.filter(m => m.id !== p.old.id));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [store?.id]);

  // ── Store open/close toggle ────────────────────────────────
  const toggleOpen = useCallback(async (isOpen) => {
    if (!store) return;
    await supabase.from('stores').update({ is_open: isOpen }).eq('id', store.id);
    setStore(prev => ({ ...prev, is_open: isOpen }));
  }, [store]);

  // ── Update store details ───────────────────────────────────
  const updateStore = useCallback(async (updates) => {
    if (!store) return;
    const { error: e } = await supabase.from('stores').update(updates).eq('id', store.id);
    if (e) throw e;
    setStore(prev => ({ ...prev, ...updates }));
  }, [store]);

  // ── Menu item CRUD ─────────────────────────────────────────
  const addMenuItem = useCallback(async (item) => {
    if (!store) throw new Error('No store loaded');
    const { data, error: e } = await supabase.from('menu_items')
      .insert({ ...item, store_id: store.id })
      .select().single();
    if (e) throw e;
    setMenu(prev => [...prev, data]);
    return data;
  }, [store]);

  const updateMenuItem = useCallback(async (itemId, updates) => {
    const { error: e } = await supabase.from('menu_items').update(updates).eq('id', itemId);
    if (e) throw e;
    setMenu(prev => prev.map(m => m.id === itemId ? { ...m, ...updates } : m));
  }, []);

  const toggleItemAvailability = useCallback(async (itemId) => {
    const item = menu.find(m => m.id === itemId);
    if (!item) return;
    await updateMenuItem(itemId, { is_available: !item.is_available });
  }, [menu, updateMenuItem]);

  const deleteMenuItem = useCallback(async (itemId) => {
    const { error: e } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (e) throw e;
    setMenu(prev => prev.filter(m => m.id !== itemId));
  }, []);

  // ── Attendant management ───────────────────────────────────
  const addAttendant = useCallback(async ({ name, role = 'Attendant', pin, color = '#C144D4' }) => {
    if (!store) throw new Error('No store loaded');
    const { data: hashed, error: hErr } = await supabase.rpc('hash_pin', { p_pin: pin });
    if (hErr) throw hErr;
    const { data, error: e } = await supabase.from('store_attendants')
      .insert({ store_id: store.id, name, role, pin_hash: hashed, color, is_active: true })
      .select().single();
    if (e) throw e;
    setAttendants(prev => [...prev, data]);
    return data;
  }, [store]);

  const updateAttendant = useCallback(async (attId, updates) => {
    const payload = { ...updates };
    if (payload.pin) {
      const { data: hashed, error: hErr } = await supabase.rpc('hash_pin', { p_pin: payload.pin });
      if (hErr) throw hErr;
      payload.pin_hash = hashed;
      delete payload.pin;
    }
    const { error: e } = await supabase.from('store_attendants').update(payload).eq('id', attId);
    if (e) throw e;
    setAttendants(prev => prev.map(a => a.id === attId ? { ...a, ...payload } : a));
  }, []);

  const removeAttendant = useCallback(async (attId) => {
    await supabase.from('store_attendants').update({ is_active: false }).eq('id', attId);
    setAttendants(prev => prev.map(a => a.id === attId ? { ...a, is_active: false } : a));
  }, []);

  const verifyAttendantPin = useCallback(async (attId, pin) => {
    const { data } = await supabase.rpc('verify_attendant_pin', {
      p_attendant_id: attId, p_pin: pin,
    });
    return !!data;
  }, []);

  const recordAttendantSession = useCallback(async (attId) => {
    if (!store) return;
    await supabase.from('attendant_sessions').insert({
      attendant_id: attId, store_id: store.id,
    });
  }, [store]);

  // ── Analytics: order data for charts ──────────────────────
  const storeAnalytics = useCallback(async (range = '7d') => {
    if (!store) return { orders: [], revenue: 0, orderCount: 0, topItems: [] };

    const daysMap = { '7d':7, '1m':30, '3m':90, '6m':180, '1y':365 };
    const days    = daysMap[range] ?? 7;
    const since   = new Date();
    since.setDate(since.getDate() - days);

    const [{ data: ords }, { data: items }] = await Promise.all([
      supabase.from('orders')
        .select('id, total, created_at, status, customer_id')
        .eq('store_id', store.id)
        .gte('created_at', since.toISOString())
        .eq('status', 'delivered'),
      supabase.from('order_items')
        .select('name, quantity, order_id')
        .in('order_id', (await supabase.from('orders').select('id').eq('store_id', store.id).eq('status','delivered').gte('created_at', since.toISOString())).data?.map(o => o.id) ?? []),
    ]);

    const orders  = ords ?? [];
    const revenue = orders.reduce((s, o) => s + o.total, 0);

    // Group by day for chart
    const byDay = {};
    orders.forEach(o => {
      const day = o.created_at.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + o.total;
    });
    const chartData = Object.entries(byDay)
      .map(([date, rev]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-NG', { month:'short', day:'numeric' }),
        revenue: rev / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top selling items
    const itemCounts = {};
    (items ?? []).forEach(({ name, quantity }) => {
      itemCounts[name] = (itemCounts[name] ?? 0) + quantity;
    });
    const topItems = Object.entries(itemCounts)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    return { orders, chartData, revenue: revenue / 100, orderCount: orders.length, topItems };
  }, [store]);

  // ── Computed ───────────────────────────────────────────────
  const activeMenu    = menu.filter(m => m.is_available);
  const inactiveMenu  = menu.filter(m => !m.is_available);
  const activeStaff   = attendants.filter(a => a.is_active);

  return {
    store, menu, activeMenu, inactiveMenu,
    attendants, activeStaff, loading, error,
    refresh: fetchStore,
    toggleOpen, updateStore,
    addMenuItem, updateMenuItem, toggleItemAvailability, deleteMenuItem,
    addAttendant, updateAttendant, removeAttendant,
    verifyAttendantPin, recordAttendantSession,
    storeAnalytics,
  };
}