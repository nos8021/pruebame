const CACHE_NAME = 'lumina-v2-offline';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react@^19.2.4',
  'https://esm.sh/react-dom@^19.2.4/client',
  'https://esm.sh/pdfjs-dist@4.0.379',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});