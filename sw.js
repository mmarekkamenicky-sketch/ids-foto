const CACHE = "ids-foto-v2";
const CORE = ["./", "./index.html", "./manifest.json", "./sw.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

// runtime cache: čo raz načítaš (aj CDN knižnicu), pôjde potom aj offline
self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    if (cached) return cached;

    try {
      const fresh = await fetch(e.request);
      // uložíme do cache aj externé veci (napr. xlsx knižnicu)
      cache.put(e.request, fresh.clone());
      return fresh;
    } catch (err) {
      // fallback na appku
      return cache.match("./index.html");
    }
  })());
});
