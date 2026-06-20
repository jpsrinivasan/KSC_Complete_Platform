// Krishnagiri School Connect — Service Worker
// Enables offline use on phones with low connectivity

const CACHE_NAME = 'ksc-v1.0';
const URLS_TO_CACHE = [
  './',
  './KSC_Complete_Platform.html',
  './manifest.json'
];

// Install — cache all files
self.addEventListener('install', event => {
  console.log('[KSC SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[KSC SW] Caching app files');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  console.log('[KSC SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If network fails and nothing in cache, show offline page
        return caches.match('./KSC_Complete_Platform.html');
      });
    })
  );
});
