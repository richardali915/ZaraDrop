// src/hooks/useStores.js
// Production-grade store discovery hook.
// • Debounced search (300ms) — no hammering the DB on every keystroke
// • Category + type filtering
// • Live open/close realtime updates
// • Featured stores prioritised
// • Menu cache — don't re-fetch if already loaded in this session

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const MENU_CACHE = new Map();   // storeId → { items, ts }
const MENU_TTL   = 5 * 60_000; // 5 min

export function useStores(type = null) {
  const [stores,    setStores]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [searching, setSearching] = useState(false);
  const [error,     setError]     = useState(null);

  const mounted      = useRef(true);
  const searchTimer  = useRef(null);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(searchTimer.current); }; }, []);

  // ── Fetch stores (with optional type filter) ───────────────
  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let q = supabase
        .from('stores')
        .select(`
          id, store_id, name, category, logo, tagline,
          address, location, hours, description,
          is_open, is_featured, rating, total_reviews, type
        `)
        .is('deleted_at', null)
        .order('is_featured', { ascending: false })
        .order('is_open',     { ascending: false })   // open stores first
        .order('rating',      { ascending: false });

      if (type) q = q.eq('type', type);

      const { data, error: qErr } = await q;
      if (qErr) throw qErr;
      if (mounted.current) setStores(data ?? []);
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetch(); }, [fetch]);

  // ── Realtime: store open/close toggles ────────────────────
  useEffect(() => {
    if (!stores.length) return;
    const ch = supabase.channel('stores_availability')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'stores',
      }, (p) => {
        if (!mounted.current) return;
        setStores(prev => prev.map(s =>
          s.id === p.new.id ? { ...s, is_open: p.new.is_open, rating: p.new.rating } : s
        ));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [stores.length]);

  // ── Fetch menu (cached) ────────────────────────────────────
  const fetchMenu = useCallback(async (storeDbId) => {
    const cached = MENU_CACHE.get(storeDbId);
    if (cached && Date.now() - cached.ts < MENU_TTL) return cached.items;

    const { data } = await supabase
      .from('menu_items')
      .select('id, name, price, emoji, category, is_available, stock, is_popular')
      .eq('store_id', storeDbId)
      .order('is_popular', { ascending: false })
      .order('created_at');

    const items = data ?? [];
    MENU_CACHE.set(storeDbId, { items, ts: Date.now() });
    return items;
  }, []);

  // Invalidate menu cache (call after placing order to reflect stock changes)
  const invalidateMenuCache = useCallback((storeDbId) => {
    if (storeDbId) MENU_CACHE.delete(storeDbId);
    else MENU_CACHE.clear();
  }, []);

  // ── Fetch active ads ───────────────────────────────────────
  const fetchAds = useCallback(async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('store_ads')
      .select('*, stores(name, logo, location)')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .order('created_at');
    return data ?? [];
  }, []);

  // ── Debounced search ───────────────────────────────────────
  const searchStores = useCallback((query, onResults) => {
    clearTimeout(searchTimer.current);
    if (!query.trim()) { onResults([]); return; }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        let q = supabase
          .from('stores')
          .select('id, store_id, name, category, logo, location, is_open, type, rating, tagline')
          .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
          .is('deleted_at', null)
          .order('is_featured', { ascending: false })
          .order('rating',      { ascending: false })
          .limit(20);

        if (type) q = q.eq('type', type);
        const { data } = await q;
        if (mounted.current) { onResults(data ?? []); setSearching(false); }
      } catch { if (mounted.current) setSearching(false); }
    }, 300);
  }, [type]);

  // ── Computed ───────────────────────────────────────────────
  const openStores     = stores.filter(s => s.is_open);
  const closedStores   = stores.filter(s => !s.is_open);
  const featuredStores = stores.filter(s => s.is_featured && s.is_open);

  return {
    stores, openStores, closedStores, featuredStores,
    loading, searching, error,
    refresh: fetch,
    fetchMenu, invalidateMenuCache,
    fetchAds,
    searchStores,
  };
}