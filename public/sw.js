// public/sw.js — ZaraDrop Service Worker
// Handles push notifications even when the app tab is closed.
// Registered automatically by src/index.js on first load.

const CACHE_NAME = 'zaradrop-v2';

// ── Install: cache essential shell assets ──────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ZaraDrop service worker');
  self.skipWaiting();
});

// ── Activate: clean old caches ─────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Push event: show notification from push server ─────────
// This fires when a push arrives from your push server (e.g. Supabase
// Edge Function calling web-push). Even if the browser tab is closed.
self.addEventListener('push', (event) => {
  let data = { title: 'ZaraDrop ⚡', body: 'You have a new notification', icon: '/icon-192.png', badge: '/badge-72.png', tag: 'zaradrop-push' };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon    || '/icon-192.png',
      badge:   data.badge   || '/badge-72.png',
      tag:     data.tag     || 'zaradrop',
      data:    data.url     || '/',
      vibrate: [200, 100, 200],
      actions: data.actions || [],
    })
  );
});

// ── Notification click: focus or open the app ──────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a ZaraDrop tab is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url });
          return;
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── Background sync (optional) ─────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Future: sync offline order drafts
  console.log('[SW] Background sync triggered');
}