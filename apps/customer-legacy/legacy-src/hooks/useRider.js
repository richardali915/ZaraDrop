// src/hooks/useRider.js
// Production-grade rider hook.
// • Real geolocation tracking — updates DB every 30s when online
// • Earnings history with chart-ready data
// • Custom request management with quote flow
// • Realtime daily stats
// • Cancellation tracking

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, callFn } from '@zaradrop/lib';

const LOCATION_INTERVAL_MS = 30_000;

export function useRider(userId) {
  const [profile,    setProfile]    = useState(null);
  const [dailyStats, setDailyStats] = useState({ deliveries:0, earnings:0, bonus:0, cancellations:0 });
  const [customReqs, setCustomReqs] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const mounted      = useRef(true);
  const locTimer     = useRef(null);
  const lastLocation = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearInterval(locTimer.current); }; }, []);

  // ── Fetch all rider data ───────────────────────────────────
  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [{ data: rp }, { data: stats }, { data: reqs }] = await Promise.all([
        supabase.from('rider_profiles')
          .select('*, profiles(name, email, avatar_url, phone)')
          .eq('id', userId).single(),

        supabase.from('rider_daily_stats')
          .select('*')
          .eq('rider_id', userId).eq('stat_date', today).maybeSingle(),

        supabase.from('custom_delivery_requests')
          .select(`
            *,
            customer:profiles!custom_delivery_requests_customer_id_fkey(
              id, name, phone, avatar_url
            )
          `)
          .eq('rider_id', userId)
          .in('status', ['pending_quote'])
          .order('created_at', { ascending: false }),
      ]);

      if (mounted.current) {
        setProfile(rp ?? null);
        setDailyStats(stats ?? { deliveries:0, earnings:0, bonus:0, cancellations:0 });
        setCustomReqs(reqs ?? []);
      }
    } catch (e) {
      if (mounted.current) setError(e.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [userId, today]);

  useEffect(() => { fetch(); }, [fetch]);

  // ── Realtime: stats + custom requests ─────────────────────
  useEffect(() => {
    if (!userId) return;

    const ch1 = supabase.channel(`rider_reqs_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'custom_delivery_requests',
        filter: `rider_id=eq.${userId}`,
      }, (p) => mounted.current && setCustomReqs(prev => [p.new, ...prev]))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'custom_delivery_requests',
        filter: `rider_id=eq.${userId}`,
      }, (p) => mounted.current && setCustomReqs(prev => prev.map(r => r.id === p.new.id ? { ...r, ...p.new } : r)))
      .subscribe();

    const ch2 = supabase.channel(`rider_stats_${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'rider_daily_stats',
        filter: `rider_id=eq.${userId}`,
      }, (p) => {
        if (mounted.current && p.new.stat_date === today) setDailyStats(p.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [userId, today]);

  // ── Geolocation tracking ───────────────────────────────────
  const _pushLocation = useCallback(async (lat, lng) => {
    // Skip if location hasn't changed significantly (50m threshold)
    if (lastLocation.current) {
      const { lat: pLat, lng: pLng } = lastLocation.current;
      const dist = Math.sqrt(Math.pow(lat - pLat, 2) + Math.pow(lng - pLng, 2));
      if (dist < 0.0005) return; // ~50m
    }
    lastLocation.current = { lat, lng };
    await supabase.from('rider_profiles')
      .update({ current_lat: lat, current_lng: lng })
      .eq('id', userId);
  }, [userId]);

  const startLocationTracking = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    clearInterval(locTimer.current);

    const push = () => {
      navigator.geolocation.getCurrentPosition(
        pos => _pushLocation(pos.coords.latitude, pos.coords.longitude),
        () => {}, // silent fail — GPS errors are non-fatal
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    push(); // immediate
    locTimer.current = setInterval(push, LOCATION_INTERVAL_MS);
  }, [_pushLocation]);

  const stopLocationTracking = useCallback(() => {
    clearInterval(locTimer.current);
  }, []);

  // ── Toggle online status ───────────────────────────────────
  const toggleOnline = useCallback(async (isOnline) => {
    const { error: e } = await supabase.from('rider_profiles')
      .update({ is_online: isOnline }).eq('id', userId);
    if (e) throw e;
    setProfile(prev => ({ ...prev, is_online: isOnline }));

    if (isOnline) startLocationTracking();
    else stopLocationTracking();
  }, [userId, startLocationTracking, stopLocationTracking]);

  // ── Custom request: send quote ─────────────────────────────
  const sendQuote = useCallback(async (requestId, priceNaira) => {
    const res = await callFn('send-quote', {
      action:     'quote',
      request_id: requestId,
      price:      priceNaira * 100,
    });
    setCustomReqs(prev => prev.filter(r => r.id !== requestId));
    return res;
  }, []);

  // ── Custom request: decline ────────────────────────────────
  const declineRequest = useCallback(async (requestId, reason = 'Cannot take this job') => {
    const res = await callFn('send-quote', {
      action:         'decline_request',
      request_id:     requestId,
      decline_reason: reason,
    });
    setCustomReqs(prev => prev.filter(r => r.id !== requestId));
    return res;
  }, []);

  // ── Earnings history (chart-ready) ────────────────────────
  const fetchEarningsHistory = useCallback(async (days = 7) => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await supabase
      .from('rider_daily_stats')
      .select('stat_date, deliveries, earnings, bonus, cancellations')
      .eq('rider_id', userId)
      .gte('stat_date', since.toISOString().split('T')[0])
      .order('stat_date', { ascending: true });

    return (data ?? []).map(d => ({
      date:          d.stat_date,
      label:         new Date(d.stat_date).toLocaleDateString('en-NG', { weekday:'short' }),
      deliveries:    d.deliveries,
      earnings:      d.earnings / 100,    // in naira
      bonus:         (d.bonus ?? 0) / 100,
      cancellations: d.cancellations ?? 0,
      total:         (d.earnings + (d.bonus ?? 0)) / 100,
    }));
  }, [userId]);

  // ── List all verified riders (for RequestRider modal) ─────
  const fetchAllRiders = useCallback(async () => {
    const { data } = await supabase
      .from('rider_profiles')
      .select('id, rider_id, vehicle, area, rating, total_trips, is_online, profiles(name, avatar_url)')
      .eq('is_verified', true)
      .order('rating', { ascending: false })
      .limit(50);

    return (data ?? []).map(r => ({
      id:       r.id,
      rider_id: r.rider_id,
      name:     r.profiles?.name ?? 'Rider',
      avatar:   r.profiles?.avatar_url,
      vehicle:  r.vehicle,
      area:     r.area,
      rating:   r.rating,
      trips:    r.total_trips,
      online:   r.is_online,
      emoji:    r.vehicle === 'Car' ? '🚗' : '🏍️',
    }));
  }, []);

  // ── Computed ───────────────────────────────────────────────
  const earningsNaira      = (dailyStats?.earnings ?? 0) / 100;
  const bonusNaira         = (dailyStats?.bonus ?? 0) / 100;
  const todayTotal         = earningsNaira + bonusNaira;
  const cancellationCount  = dailyStats?.cancellations ?? 0;
  const isOnline           = profile?.is_online ?? false;

  return {
    profile, dailyStats, customReqs, loading, error,
    earningsNaira, bonusNaira, todayTotal, cancellationCount, isOnline,
    refresh: fetch,
    toggleOnline,
    startLocationTracking, stopLocationTracking,
    sendQuote, declineRequest,
    fetchEarningsHistory, fetchAllRiders,
  };
}