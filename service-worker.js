const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  './index.html',
  './manifest.json'
  // أضف هنا أي ملفات أخرى تريد تخزينها مثل style.css أو script.js
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// جلب الملفات من التخزين المؤقت عند غياب الإنترنت
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});