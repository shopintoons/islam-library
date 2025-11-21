const CACHE_NAME = "islam-library-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./books.json",
  "./manifest.webmanifest",
  "./assets/cat-coran.jpg",
  "./assets/cat-livres.jpg",
  "./assets/cat-doua.jpg",
  "./assets/riyad.jpg",
  "./assets/bukhari.jpg",
  "./assets/muslim.jpg",
  "./assets/citadelle.jpg",
  "./assets/coran1.jpg",
  "./assets/doua1.jpg",
  "./assets/doua2.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

