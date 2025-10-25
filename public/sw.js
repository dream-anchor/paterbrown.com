// Service Worker for offline functionality and performance
const CACHE_NAME = 'pater-brown-v3';
const STATIC_CACHE = 'pater-brown-static-v3';
const DYNAMIC_CACHE = 'pater-brown-dynamic-v3';
const IMAGE_CACHE = 'pater-brown-images-v3';
const FONT_CACHE = 'pater-brown-fonts-v3';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
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
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, FONT_CACHE, CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - optimized caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (all fonts are now local)
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Font files - cache-first with long TTL
  if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return response || fetch(request).then((fetchResponse) => {
            if (fetchResponse && fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Image files - stale-while-revalidate
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif|gif|ico)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((fetchResponse) => {
            if (fetchResponse && fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // CSS/JS files - network-first with cache fallback
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(request)
        .then((fetchResponse) => {
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return fetchResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // HTML - network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Default strategy for everything else
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }

          const responseToCache = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return fetchResponse;
        });
      })
      .catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
