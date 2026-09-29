const CACHE_NAME = 'adi-kitchen-app-v1';
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest', './adi-kitchen-logo.png',
  './icons/icon-32.png', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match('./index.html'))));
    return;
  }
  // Cache the Supabase JS CDN after the first online visit so the app shell can
  // still boot without internet. Network is still used whenever available.
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('unpkg.com')) {
    event.respondWith(caches.match(req).then(cached => {
      const network = fetch(req).then(res => { const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)); return res; }).catch(() => cached);
      return cached || network;
    }));
  }
});
