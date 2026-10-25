// Service Worker: legt alle Dateien der App beim Installieren im Cache ab,
// damit Habit komplett offline läuft.
// Bei jeder Änderung an einer Datei die Version erhöhen, dann holt sich
// die App beim nächsten Start die neuen Dateien.

const VERSION = 'habit-v1';

const FILES = [
  './',
  'index.html',
  'manifest.json',
  'css/fonts.css',
  'css/styles.css',
  'js/app.js',
  'js/icons.js',
  'js/quotes.js',
  'js/storage.js',
  'fonts/amiri-normal-400.woff2',
  'fonts/amiri-normal-700.woff2',
  'fonts/bricolage-grotesque-normal-500-800.woff2',
  'fonts/instrument-sans-normal-400-600.woff2',
  'fonts/reem-kufi-arabic-500-700.woff2',
  'fonts/reem-kufi-latin-500-700.woff2',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/logo.svg',
  'images/arches.svg',
  'images/atlas.svg',
  'images/desert.svg',
  'images/sunrise.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Seitenaufrufe: immer die App-Hülle aus dem Cache, auch offline
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cached) => cached || fetch(request)),
    );
    return;
  }

  // Alles andere: zuerst Cache, sonst Netz (und dann für später merken)
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return res;
      });
    }),
  );
});
