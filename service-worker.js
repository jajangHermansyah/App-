const CACHE_NAME = "App+-v1.1";

const urlsToCache = [
  "./",
  "./index.html",
  "./icon.jpg",
  "./manifest.json"
];

// Install → simpan cache awal (core)
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate → hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🔥 Fetch → AUTO CACHE SEMUA FILE
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response; // ambil dari cache
      }

      return fetch(event.request).then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, res.clone()); // 🔥 simpan otomatis
          return res;
        });
      }).catch(() => {
        // optional fallback (kalau offline total)
        return caches.match("./index.html");
      });
    })
  );
});
