const CACHE_VERSION = 'click-2026-05-20';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL = './index.html';

const PRECACHE_URLS = [
  './', './index.html', './index.css', './index.js', './CountryCodes.json', './site.webmanifest',
  './favicon.svg', './identity/og-image.png', './identity/browserconfig.xml', './identity/favicon-16x16.png',
  './identity/favicon-32x32.png', './identity/apple-touch-icon.png', './identity/android-chrome-192x192.png',
  './identity/android-chrome-512x512.png', './identity/maskable-icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE)
    .then((cache) => Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' })))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) || caches.match(APP_SHELL);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((response) => {
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  if (cached) {
    event.waitUntil(networkPromise.catch(() => undefined));
    return cached;
  }
  return (await networkPromise) || caches.match(APP_SHELL);
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationResponse(event.request));
    return;
  }
  const precachedPathnames = PRECACHE_URLS.map((url) => new URL(url, self.registration.scope).pathname);
  event.respondWith(precachedPathnames.includes(requestUrl.pathname) ? cacheFirst(event.request) : staleWhileRevalidate(event.request, event));
});
