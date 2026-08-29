/* Stale browser registrations may still request /sw.js in local development.
 * This admin app does not use a service worker, so respond with a safe no-op.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
