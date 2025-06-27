const CACHE_NAME = 'pwa-notite-cache-v5';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/db.js',
    '/manifest.json',
    '/images/icon.svg' 
];

// Evenimentul 'install': se declanseaza la instalarea Service Worker-ului
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache deschis');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Evenimentul 'fetch': se declanseaza pentru fiecare cerere facuta de pagina
self.addEventListener('fetch', event => {
    // Nu interceptam cererile catre API
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        // Incercam sa gasim resursa in cache
        caches.match(event.request)
            .then(response => {
                // Daca o gasim in cache, o returnam
                if (response) {
                    return response;
                }
                // Daca nu, incercam sa o luam de pe retea
                return fetch(event.request);
            })
    );
});