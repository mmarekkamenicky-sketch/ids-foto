const CACHE = "ids-foto-v3"; // keď zmeníš DB, zmeň na v4, v5...

const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./db.xlsx" // DB je súčasť appky
];

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

self.addEventListener("fetch", (e) => {
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    if (cached) return cached;

    try {
      const fresh = await fetch(e.request);
      cache.put(e.request, fresh.clone());
      return fresh;
    } catch {
      return cache.match("./index.html");
    }
  })());
});
