const CACHE='adi-kitchen-pwa-v3';
const APP_SHELL=[
  './',
  './index.html',
  './manifest.json',
  './manifest.webmanifest',
  './adi-kitchen-logo.png',
  './icons/icon-32.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  // Only cache this GitHub Pages app. Supabase/CDN requests remain network requests.
  if(url.origin!==self.location.origin) return;
  event.respondWith(
    fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html')))
  );
});
