/**
 * Service Worker for Portfolio Caching
 * Provides offline functionality and aggressive caching for better performance
 */

const CACHE_NAME = 'portfolio-v1.2';
const STATIC_CACHE_NAME = 'portfolio-static-v1.2';
const DYNAMIC_CACHE_NAME = 'portfolio-dynamic-v1.2';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/noscript.css',
    '/assets/js/jquery.min.js',
    '/assets/js/browser.min.js',
    '/assets/js/breakpoints.min.js',
    '/assets/js/util.js',
    '/assets/js/main.js',
    '/assets/js/webp-support.js',
    '/assets/js/responsive-images.js',
    '/assets/css/fontawesome-all.min.css',
    '/camera-icon.svg',
    '/portfolio-qr-code.png'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
    // Static assets - cache first, then network
    static: [
        '/assets/css/',
        '/assets/js/',
        '/assets/css/fontawesome-all.min.css'
    ],
    // Images - cache first for performance
    images: [
        '/images/',
        '.webp',
        '.png',
        '.jpg',
        '.jpeg',
        '.svg'
    ],
    // External resources - network first
    external: [
        'https://www.youtube.com',
        'https://fonts.googleapis.com',
        'https://www.linkedin.com',
        'https://www.artstation.com'
    ]
};

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    
    // Static assets - Cache First
    if (isStaticAsset(url)) {
        return cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // Images - Cache First with Stale While Revalidate
    if (isImage(url)) {
        return staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
    }
    
    // External resources - Network First
    if (isExternalResource(url)) {
        return networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // Everything else - Network First
    return networkFirst(request, DYNAMIC_CACHE_NAME);
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache First failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First strategy
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Offline', { status: 503 });
    }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Helper functions to categorize requests
function isStaticAsset(url) {
    return CACHE_STRATEGIES.static.some(pattern => 
        url.pathname.includes(pattern)
    );
}

function isImage(url) {
    return CACHE_STRATEGIES.images.some(pattern => 
        url.pathname.includes(pattern) || url.pathname.endsWith(pattern)
    );
}

function isExternalResource(url) {
    return CACHE_STRATEGIES.external.some(pattern => 
        url.href.startsWith(pattern)
    );
}

// Background sync for analytics (if needed)
self.addEventListener('sync', event => {
    if (event.tag === 'analytics') {
        event.waitUntil(sendAnalytics());
    }
});

async function sendAnalytics() {
    // Implement analytics sending logic here
    console.log('Background sync: Sending analytics');
}
