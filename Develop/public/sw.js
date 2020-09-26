importScripts('./js/idb.js');

// files to cache
const cacheName = 'v1';
const cachingFiles = [
    '/css/styles.css',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/js/idb.js',
    '/js/index.js',
    'index.html',
    'manifest.json',
    'manifest.webmanifest'
]


// installing service worker and cache files
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
            console.log('[Service Worker] Caching ...');
            return cache.addAll(cachingFiles);
        })
    );
});



// fetching content using service worker
self.addEventListener('fetch', (event) => {
    if (!(event.request.url.indexOf('http') === 0)) return;
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if(response) {
                    console.log('[Service Worker] Fetching resource: '+ event.request.url + ' from cache');
                    return response;
                } else {
                    return fetch(event.request)
                        .then(response => {
                            // return caches.open(cacheName)
                            //     .then(cache => {
                            //         console.log('[Service Worker] Caching new resource: ' + event.request.url);
                            //         cache.put(event.request, response.clone());
                            //         return response;
                            //     })
                            return response;
                        })
                        .catch(err => {
                            console.log('there is no internet connection now! data will be stored inside indexedDB and will be sync with server when connection is back...')
                        })
                }
            })
    )
})


// sync background data
self.addEventListener('sync', event => {
    if (event.tag === 'sync-transactions') {
        console.log('syncing data ...');
        event.waitUntil(syncData());
    }
});


