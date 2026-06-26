// Enterprise Housing Pledge (EHP) — Service Worker
// Cache version — bump to force re-cache on deploy
const CACHE_NAME = "ehp-v1";

// Assets to pre-cache immediately on install
const PRECACHE_URLS = [
  "/",
  "/main.js",
  "/assets/styles.css",
  "/assets/logo.jpg",
  "/manifest.json"
];

// ── Install: pre-cache critical assets & skip waiting ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Attempt each URL individually so one failure doesn't block the rest
      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn(`[SW] Pre-cache failed for ${url}:`, err);
        }
      }
    })()
  );
  self.skipWaiting();
});

// ── Activate: prune stale caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })()
  );
  self.clients.claim();
});

// ── Helper: Cache-first strategy ──
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// ── Helper: Network-first strategy (with fallback) ──
async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503 });
  }
}

// ── Fetch: route to strategy based on path ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests from our origin
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // 1. API calls: network-first (fresh data), fallback to cache if offline
  if (path.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 2. Static built assets: cache-first (they never change between deploys)
  if (path.match(/\.(js|css|jpg|jpeg|png|svg|ico|woff2?)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3. Navigation / SPA routes: network-first, fallback to cached index.html
  if (request.mode === "navigate" || path === "/") {
    event.respondWith(networkFirst(request, "/index.html"));
    return;
  }

  // 4. Everything else (manifest, sw itself): network-first
  event.respondWith(networkFirst(request));
});
