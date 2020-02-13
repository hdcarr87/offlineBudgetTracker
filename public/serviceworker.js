const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/style.css"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("cached");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Old cache data removed", key);
                    }
                })
            );
        })
    );
    self.ClientRectList.claim();
});

self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/transaction")) {
        console.log("[Service Worker] Fetch (data)", evt.request.url);
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                  .then(response => {
                    if (response.status === 200) {
                      cache.put(evt.request.url, response.clone());
                    }
                    return response;
                  })
                  .catch(err => {
                    return cache.match(evt.request);
                  });
              })
            );
            return;
        }
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
            });
        })
    )});
    