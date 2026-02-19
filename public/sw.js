// Simple service worker to cache images with a cache-first strategy
const CACHE_NAME = "achi-static-v1";
const IMAGE_CACHE = "achi-images-v1";
const VERSION = 1;

self.addEventListener("install", (evt) => {
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== "GET") return;

  // Cache-first for images (including any under /images/)
  if (req.destination === "image" || url.pathname.startsWith("/images/")) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req)
            .then((res) => {
              // if response not ok, just return it (don't cache)
              if (!res || res.status !== 200) return res;
              cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached);
        }),
      ),
    );
    return;
  }

  // For navigation/document requests try network first, fallback to cache
  if (
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html")
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // default: try network then fallback to cache
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
