// Service Worker untuk PWA
const CACHE_NAME = 'madrasah-v1.0.2';  // Update version
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/punch.html',
    '/daftar.html',
    '/css/style.css',
    '/css/punch.css',
    '/css/home.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/admin.js',
    '/js/parent.js',
    '/js/data.js',
    '/js/translations.js',
    '/js/punch-admin.js',
    '/js/punch.js',
    '/js/home.js',
    '/manifest.json'
];

// Install
self.addEventListener('install', function(event) {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[SW] Caching files');
                return cache.addAll(urlsToCache).catch(function(err) {
                    console.log('[SW] Cache error:', err);
                });
            })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', function(event) {
    console.log('[SW] Activate');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Delete old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch - Network First, fallback to cache
self.addEventListener('fetch', function(event) {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip Firebase & external APIs
    if (event.request.url.indexOf('firebase') > -1 ||
        event.request.url.indexOf('googleapis') > -1 ||
        event.request.url.indexOf('imgbb.com') > -1 ||
        event.request.url.indexOf('nominatim') > -1) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Clone response untuk simpan dalam cache
                var responseClone = response.clone();

                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(function() {
                // Network failed, cuba ambil dari cache
                return caches.match(event.request).then(function(cachedResponse) {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Kalau request HTML, return index.html
                    if (event.request.headers.get('accept').indexOf('text/html') > -1) {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});