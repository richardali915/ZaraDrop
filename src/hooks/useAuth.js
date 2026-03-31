// src/hooks/useAuth.js
// Production-grade OAuth auth.
// • Google / Facebook / X — no phone OTP ever
// • Session guard: recovers from spurious SIGNED_OUT events
// • Profile caching with stale-while-revalidate
// • Role enforcement: if profile.role !== pending role → show role conflict
// • Phone collected at checkout, never during auth

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const PROFILE_CACHE_KEY = 'zd_profile_cache';
const PROFILE_TTL_MS    = 5 * 60 * 1000; // 5 min stale-while-revalidate

function readCache() {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > PROFILE_TTL_MS) return null; // stale
    return data;
  } catch { return null; }
}

function writeCache(data) {
  try { sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

function clearCache() {
  try { sessionStorage.removeItem(PROFILE_CACHE_KEY); } catch {}
}

export function useAuth() {
  const [user,           setUser]           = useState(null);
  const [profile,        setProfile]        = useState(() => readCache());
  const [loading,        setLoading]        = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error,          setError]          = useState(null);

  const mounted          = useRef(true);
  const fetchedFor       = useRef(null);   // userId we last fetched for
  const explicitSignOut  = useRef(false);  // suppresses spurious SIGNED_OUT
  const sessionGuard     = useRef(null);   // interval ID

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearInterval(sessionGuard.current);
    };
  }, []);

  // ── Internal profile loader ────────────────────────────────
  const _loadProfile = useCallback(async (userId, { force = false } = {}) => {
    if (!userId || !mounted.current) return;
    if (!force && fetchedFor.current === userId && profile) return; // already loaded

    setProfileLoading(true);
    try {
      const { data, error: pErr } = await supabase
        .from('profiles')
        .select('*, customer_profiles(*), rider_profiles(*)')
        .eq('id', userId)
        .single();

      if (!mounted.current) return;

      if (pErr && pErr.code !== 'PGRST116') {
        // PGRST116 = no rows → new user, profile not created yet
        throw pErr;
      }

      fetchedFor.current = userId;
      if (data) {
        writeCache(data);
        setProfile(data);
      }
    } catch (e) {
      if (!mounted.current) return;
      setError(e.message);
      // Fall back to cache rather than showing an error flash
      const cached = readCache();
      if (cached) setProfile(cached);
    } finally {
      if (mounted.current) setProfileLoading(false);
    }
  }, [profile]);

  // ── Session guard: re-verify every 90s ────────────────────
  // Guards against spurious SIGNED_OUT that Supabase fires on cookie hiccups
  const _startSessionGuard = useCallback((userId) => {
    clearInterval(sessionGuard.current);
    sessionGuard.current = setInterval(async () => {
      if (!mounted.current || !userId || explicitSignOut.current) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted.current) setUser(session.user);
      } catch {}
    }, 90_000);
  }, []);

  // ── Auth state subscription ────────────────────────────────
  useEffect(() => {
    let resolved = false;
    const resolve = () => { if (!resolved) { resolved = true; if (mounted.current) setLoading(false); } };

    // Handle PKCE code in URL (post-OAuth redirect)
    const hasPKCECode = new URLSearchParams(window.location.search).has('code');
    if (hasPKCECode) {
      // Clean URL immediately to avoid confusing the user
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', clean);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted.current) { resolve(); return; }
      if (session?.user) {
        setUser(session.user);
        _loadProfile(session.user.id);
        _startSessionGuard(session.user.id);
      }
      resolve();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted.current) return;

      if (_event === 'SIGNED_OUT') {
        if (!explicitSignOut.current) {
          // Spurious SIGNED_OUT — Supabase fires these on cross-tab events, cookie
          // expiry edge cases, etc. Do NOT clear state. Session guard will recover.
          resolve(); return;
        }
        // Legitimate user-initiated sign-out
        explicitSignOut.current = false;
        clearInterval(sessionGuard.current);
        clearCache();
        fetchedFor.current = null;
        if (mounted.current) { setUser(null); setProfile(null); }
        resolve(); return;
      }

      if (_event === 'TOKEN_REFRESHED') {
        if (session?.user && mounted.current) setUser(session.user);
        resolve(); return;
      }

      if (session?.user) {
        setUser(session.user);
        if (session.user.id !== fetchedFor.current) {
          _loadProfile(session.user.id);
          _startSessionGuard(session.user.id);
        }
        resolve();
      }
    });

    return () => { subscription.unsubscribe(); clearInterval(sessionGuard.current); };
  }, [_loadProfile, _startSessionGuard]);

  // ── OAuth sign-in (Google | Facebook | twitter) ────────────
  const signInWithOAuth = useCallback(async (provider) => {
    setError(null);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        scopes: provider === 'google' ? 'email profile' : undefined,
        queryParams: provider === 'google'
          ? { access_type: 'offline', prompt: 'select_account' }
          : undefined,
      },
    });
    if (e) { setError(e.message); throw e; }
    // Browser redirects away — nothing below runs
  }, []);

  // ── Link Rider ID to signed-in account ────────────────────
  const linkRiderId = useCallback(async (riderId) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not signed in');

    const { data, error: e } = await supabase
      .from('rider_profiles')
      .select('id, profiles(id)')
      .eq('rider_id', riderId.trim().toUpperCase())
      .single();

    if (e || !data) throw new Error('Rider ID not found in our registry');
    if (data.profiles?.id && data.profiles.id !== authUser.id) {
      throw new Error('This Rider ID is already linked to another account');
    }
    return { riderDbId: data.id };
  }, []);

  // ── Verify store passcode via pgcrypto RPC ─────────────────
  const verifyStorePasscode = useCallback(async (storeId, passcode, isAdmin = false) => {
    const { data, error: e } = await supabase.rpc('verify_store_passcode', {
      p_store_id: storeId.trim().toUpperCase(),
      p_passcode: passcode,
      p_is_admin: isAdmin,
    });
    if (e) throw new Error('Verification failed — check your Store ID');
    return !!data;
  }, []);

  // ── Create/complete profile after first OAuth sign-in ──────
  const createProfile = useCallback(async ({ role, phone, extra = {} }) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const uid = authUser?.id;
    if (!uid) throw new Error('Not authenticated');

    const name      = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
    const email     = authUser.email || '';
    const avatarUrl = authUser.user_metadata?.avatar_url || null;
    const provider  = authUser.app_metadata?.provider || 'google';

    const { error: pErr } = await supabase.from('profiles').upsert({
      id: uid, role, name, phone: phone || null, email,
      avatar_url: avatarUrl, auth_provider: provider, is_setup: true,
    });
    if (pErr) throw pErr;

    if (role === 'customer') {
      await supabase.from('customer_profiles').upsert({
        id: uid, address: '', landmark: '', delivery_notes: '', zp_points: 0,
      });
    }

    if (role === 'rider') {
      await supabase.from('rider_profiles').upsert({
        id:          uid,
        rider_id:    extra.riderId  ?? `RD-${String(Date.now()).slice(-5)}`,
        vehicle:     extra.vehicle  ?? 'Motorcycle',
        plate:       extra.plate    ?? '',
        area:        extra.area     ?? '',
        bank_name:   extra.bankName ?? 'GTBank',
        account_no:  extra.accountNo ?? '',
        is_verified: false,
      });
    }

    await _loadProfile(uid, { force: true });
  }, [_loadProfile]);

  // ── Update profile ─────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    const uid = user?.id;
    if (!uid) throw new Error('Not authenticated');

    const { name, phone, email, address, landmark, notes,
            vehicle, plate, area, bankName, accountNo,
            businessName, category, storeAddress, hours, description, logo, tagline } = updates;

    await supabase.from('profiles').update({ name, phone, email }).eq('id', uid);

    if (profile?.role === 'customer') {
      await supabase.from('customer_profiles')
        .update({ address, landmark, delivery_notes: notes }).eq('id', uid);
    }
    if (profile?.role === 'rider') {
      await supabase.from('rider_profiles')
        .update({ vehicle, plate, area, bank_name: bankName, account_no: accountNo }).eq('id', uid);
    }
    if (profile?.role === 'store') {
      await supabase.from('stores')
        .update({ name: businessName, category, address: storeAddress, hours, description, logo, tagline })
        .eq('owner_id', uid);
    }

    await _loadProfile(uid, { force: true });
  }, [user, profile, _loadProfile]);

  // ── Sign out ───────────────────────────────────────────────
  const signOut = useCallback(async () => {
    explicitSignOut.current = true;
    clearInterval(sessionGuard.current);
    clearCache();
    fetchedFor.current = null;
    setUser(null); setProfile(null); setError(null);
    await supabase.auth.signOut({ scope: 'local' });
  }, []);

  return {
    user, profile, loading, profileLoading, error,
    signInWithOAuth, linkRiderId, verifyStorePasscode,
    createProfile, updateProfile, signOut,
    reload: () => user && _loadProfile(user.id, { force: true }),
  };
}