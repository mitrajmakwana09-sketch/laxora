const CACHE_NAME = "luxora-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",

    // CSS
    "./css/style.css",
    "./css/responsive.css",
    "./css/animations.css",

    // JavaScript
    "./js/app.js",

    // Data
    "./data/cars.json",

    // PWA
    "./manifest.json"
];

/* ================================
   INSTALL
================================ */

self.addEventListener("install", (event) => {

    console.log("LUXORA Service Worker: Installing...");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => {

                console.log("LUXORA: Files cached");

                return cache.addAll(FILES_TO_CACHE);

            })
    );

    self.skipWaiting();
});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", (event) => {

    console.log("LUXORA Service Worker: Activated");

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames.map((cacheName) => {

                    if (cacheName !== CACHE_NAME) {

                        console.log(
                            "LUXORA: Removing old cache:",
                            cacheName
                        );

                        return caches.delete(cacheName);
                    }

                })

            );

        })

    );

    self.clients.claim();
});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", (event) => {

    event.respondWith(

        caches.match(event.request)
            .then((cachedResponse) => {

                // If file exists in cache
                if (cachedResponse) {

                    return cachedResponse;

                }

                // Otherwise load from internet
                return fetch(event.request)

                    .then((networkResponse) => {

                        // Save successful response
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then((cache) => {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }

                        return networkResponse;

                    })

                    .catch(() => {

                        // If internet unavailable
                        return caches.match("./index.html");

                    });

            })

    );

});