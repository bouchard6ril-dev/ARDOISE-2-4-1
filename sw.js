// ARDOISE V1 - installation atomique du cache hors ligne.
const CACHE = 'ardoise-augustin-autonome-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './narrations.json'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const manifest = await fetch('./narrations.json', {cache: 'no-store'}).then(r => { if (!r.ok) throw Error('narrations.json'); return r.json(); });
    if (manifest.items.length !== 28) throw Error('pack audio incomplet');
    const urls = [...CORE, ...manifest.items.map(x => './'+x.file)];
    const cache = await caches.open(CACHE);
    // Sequential fetch avoids 28 simultaneous downloads on iOS.
    for (const url of urls) {
      const resp = await fetch(url, {cache: 'reload'});
      if (!resp.ok) throw new Error('Cache impossible : '+url);
      await cache.put(url, resp);
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const old = await caches.keys();
    await Promise.all(old.filter(k => k.startsWith('ardoise-augustin-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, {ignoreSearch: true});
    if (cached) return cached;
    return fetch(event.request);
  })());
});
