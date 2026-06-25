// src/hooks/useNotifications.js
// Production-grade notifications hook.
// • Priority levels: critical > high > normal
// • Smart toast queue: max 3 visible, FIFO with overflow suppression
// • Badge management per notification type
// • CRA-safe: process.env.REACT_APP_* only

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@zaradrop/lib';
import { showLocalNotification } from '../lib/pushNotifications';

const MAX_VISIBLE_TOASTS = 3;
const TOAST_DURATION_MS  = 5000;

// Notification priority — higher = shown first / longer
const PRIORITY = {
  cancelled:       3,
  rider_cancelled: 3,
  new_order:       3,
  delivered:       3,
  bonus:           2,
  daily_bonus:     2,
  rider_assigned:  2,
  order_placed:    1,
  topup:           1,
  transfer:        1,
  default:         0,
};

function getPriority(type) {
  return PRIORITY[type] ?? PRIORITY.default;
}

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [toasts,        setToasts]        = useState([]);
  const [loading,       setLoading]       = useState(true);

  const mounted   = useRef(true);
  const toastRefs = useRef({}); // timerId per toastId

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Clear all pending toast timers
      Object.values(toastRefs.current).forEach(clearTimeout);
    };
  }, []);

  // ── Fetch notifications ────────────────────────────────────
  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(60);

    if (mounted.current) {
      setNotifications(data ?? []);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  // ── Realtime: new notification rows ───────────────────────
  useEffect(() => {
    if (!userId) return;

    const refreshTimer = setInterval(() => fetch(), 30_000);
    const ch = supabase.channel(`notifs_rt_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const notif = payload.new;
        if (!mounted.current) return;

        // 1. Add to panel (newest first)
        setNotifications(prev => [notif, ...prev]);

        // 2. Device push (works when tab is backgrounded)
        showLocalNotification(notif);

        // 3. Queue in-app toast with smart overflow

        _queueToast({
          id:    `toast_${notif.id || Date.now()}`,
          title: notif.title,
          body:  notif.body,
          type:  notif.type,
          icon:  notif.icon,
          prio:  getPriority(notif.type),
        });
      })
      .subscribe();

    return () => {
      clearInterval(refreshTimer);
      supabase.removeChannel(ch);
    };
  }, [userId]);

  // ── Toast queue management ─────────────────────────────────
  const _queueToast = useCallback((toast) => {
    setToasts(prev => {
      const next = [...prev, toast]
        .sort((a, b) => b.prio - a.prio) // higher priority first
        .slice(0, MAX_VISIBLE_TOASTS);   // cap visible count

      // Set auto-dismiss for the new toast
      const duration = TOAST_DURATION_MS + toast.prio * 1500; // critical stays longer
      const timer = setTimeout(() => {
        if (mounted.current) {
          setToasts(p => p.filter(t => t.id !== toast.id));
          delete toastRefs.current[toast.id];
        }
      }, duration);
      toastRefs.current[toast.id] = timer;

      return next;
    });
  }, []);

  const dismissToast = useCallback((tid) => {
    clearTimeout(toastRefs.current[tid]);
    delete toastRefs.current[tid];
    setToasts(prev => prev.filter(t => t.id !== tid));
  }, []);

  // ── Mark notifications read ────────────────────────────────
  const markRead = useCallback(async (notifId) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase.from('notifications').update({ is_read: true })
      .eq('user_id', userId).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [userId]);

  // ── Computed ───────────────────────────────────────────────
  const unread     = notifications.filter(n => !n.is_read).length;
  const criticals  = notifications.filter(n => getPriority(n.type) >= 3 && !n.is_read).length;

  return {
    notifications, toasts, loading,
    unread, criticals,
    refresh:      fetch,
    markRead,     markAllRead,
    dismissToast,
  };
}