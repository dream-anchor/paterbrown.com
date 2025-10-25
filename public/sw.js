// Service Worker for offline functionality and performance
const CACHE_NAME = 'pater-brown-v2';
const STATIC_CACHE = 'pater-brown-static-v2';
const DYNAMIC_CACHE = 'pater-brown-dynamic-v2';

const urlsToCache = [
  '/',
  '/index.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((fetchResponse) => {
          // Don't cache non-GET requests or error responses
          if (request.method !== 'GET' || !fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }

          // Clone the response
          const responseToCache = fetchResponse.clone();

          // Cache static assets
          if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff|woff2)$/)) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          } else {
            // Cache dynamic content with shorter TTL
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return fetchResponse;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
