// Minimal service worker — makes the app installable (PWA requirement)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', () => {});
