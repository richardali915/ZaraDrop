import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_STATS = {
  ordersDelivered: '…',
  paidToRiders: '…',
  partnerStores: '…',
  activeRiders: '…',
  updatedAt: null,
};

export function useLandingStats() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetchStats = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);

    try {
      const [ordersCountRes, earningsRes, storesCountRes, ridersCountRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
        supabase.from('orders').select('sum(rider_earn)').eq('status', 'delivered'),
        supabase.from('stores').select('id', { count: 'exact', head: true }),
        supabase.from('rider_profiles').select('id', { count: 'exact', head: true }),
      ]);

      if (!mounted.current) return;

      if (ordersCountRes.error) throw ordersCountRes.error;
      if (earningsRes.error) throw earningsRes.error;
      if (storesCountRes.error) throw storesCountRes.error;
      if (ridersCountRes.error) throw ridersCountRes.error;

      const ordersDelivered = ordersCountRes.count ?? 0;
      const paidToRiders = earningsRes.data?.[0]?.sum ?? 0;
      const partnerStores = storesCountRes.count ?? 0;
      const activeRiders = ridersCountRes.count ?? 0;

      setStats({
        ordersDelivered,
        paidToRiders,
        partnerStores,
        activeRiders,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      if (!mounted.current) return;
      setError(err.message || 'Unable to load landing metrics');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchStats();
    return () => { mounted.current = false; };
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
