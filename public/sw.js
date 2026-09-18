// Service Worker for CartelesClick2026 - Cache Buster & Self-Unregister
// Purges stale dev caches and unregisters to prevent React duplicate instance errors

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests directly to the network without caching
  event.respondWith(fetch(event.request));
});
