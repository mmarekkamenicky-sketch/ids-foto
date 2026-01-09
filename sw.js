/* IDS Foto – Service Worker */
const CACHE_NAME = "ids-foto-cache-v26";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./db.xlsx",
  "./sw.js"
];

// Install: cache core
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    self.skipWaiting();
  })());
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve()));
    self.clients.claim();
  })());
});

// Fetch: stale-while-revalidate
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);

    // Start network update in background
    const fetchPromise = fetch(req).then((res) => {
      // Cache only successful basic responses
      if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
        cache.put(req, res.clone()).catch(()=>{});
      }
      return res;
    }).catch(() => null);

    // If cached exists, return it immediately, while updating in background
    if (cached) return cached;

    // Otherwise wait for network
    const net = await fetchPromise;
    return net || new Response("Offline", { status: 503, statusText: "Offline" });
  })());
});
