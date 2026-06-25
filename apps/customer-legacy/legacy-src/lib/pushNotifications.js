// src/lib/pushNotifications.js
// CRA-compatible. Uses process.env.REACT_APP_VAPID_PUBLIC_KEY.

// Generate VAPID keys: npx web-push generate-vapid-keys
// Then add to .env:  REACT_APP_VAPID_PUBLIC_KEY=your-public-key-here
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// ── Subscribe to Web Push ────────────────────────────────────
export async function subscribeToPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Not supported in this browser');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[Push] Permission denied by user');
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub   = await reg.pushManager.getSubscription();

    if (!sub && VAPID_PUBLIC_KEY) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    if (sub) {
      // Save subscription to Supabase push_subscriptions table
      const { supabase } = await import('./supabase');
      await supabase.from('push_subscriptions').upsert({
        user_id:    userId,
        endpoint:   sub.endpoint,
        p256dh:     btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
        auth:       btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
        user_agent: navigator.userAgent,
      }, { onConflict: 'endpoint' });
    }

    return sub;
  } catch (err) {
    console.error('[Push] Subscription failed:', err);
    return null;
  }
}

// ── Unsubscribe ───────────────────────────────────────────────
export async function unsubscribeFromPush(userId) {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      const { supabase } = await import('./supabase');
      await supabase.from('push_subscriptions').delete()
        .eq('user_id', userId).eq('endpoint', sub.endpoint);
    }
  } catch (err) {
    console.error('[Push] Unsubscribe failed:', err);
  }
}

// ── Show local notification immediately ──────────────────────
// Called by useNotifications on every new DB insert (realtime).
// Works even when the app tab is hidden.
export function showLocalNotification(notif) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const fallbackIcon = {
    new_order:      '🛍️', order_placed:   '✅', rider_assigned: '🏍️',
    delivered:      '🎉', custom_request: '🎯', quote_received: '💰',
    bonus:          '🏆', daily_bonus:    '🏆', topup:          '💰',
    transfer:       '💸', cancelled:      '❌', rider_cancelled:'⚠️',
  };

  const icon  = notif.icon || fallbackIcon[notif.type] || '⚡';
  const title = `${icon} ${notif.title}`;
  const body  = notif.body || '';

  // Prefer SW notification (works in background) over basic Notification API
  navigator.serviceWorker.ready
    .then((reg) => {
      reg.showNotification(title, {
        body,
        icon:    '/icon-192.png',
        badge:   '/badge-72.png',
        tag:     `zaradrop-${notif.id || Date.now()}`,
        vibrate: [150, 75, 150],
        data:    { notifId: notif.id, type: notif.type },
        silent:  false,
      });
    })
    .catch(() => {
      // Fallback
      new Notification(title, { body, icon: '/icon-192.png' });
    });
}