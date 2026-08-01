/* JENITIMOUN · Cluster Limbé — Service Worker (réseau d'abord, anti-cache-bloquant) */
const CACHE = 'jenitimoun-v8-2';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

/* RÉSEAU D'ABORD : toujours la version la plus récente du serveur ;
   le cache ne sert QUE si l'appareil est hors-ligne. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy).catch(function () {}); });
        return resp;
      })
      .catch(function () {
        return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
      })
  );
});
