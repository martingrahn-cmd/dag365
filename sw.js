// Firebase + Caching Service Worker för dag365
// Kombinerar offline-stöd med push-notiser

// ===== FIREBASE MESSAGING =====
// Ladda Firebase för token-hantering (behövs för getToken i frontend)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDUGbZDv4R4kPHCZez0Xsf5_iv3vqaYhYE",
    authDomain: "dag365-2065b.firebaseapp.com",
    projectId: "dag365-2065b",
    storageBucket: "dag365-2065b.firebasestorage.app",
    messagingSenderId: "213756811848",
    appId: "1:213756811848:web:e7098e7880ad4fa96d167d"
});

// Initiera Firebase messaging (behövs för token-registrering)
const messaging = firebase.messaging();

// ===== PUSH EVENT HANDLER (iOS-kompatibel) =====
// VIKTIGT: Använd direkt 'push' event istället för Firebase's onBackgroundMessage
// iOS Safari kräver att notiser visas OMEDELBART med event.waitUntil()
// Annars återkallar Safari push-tillståndet!
// Se: https://github.com/firebase/firebase-js-sdk/issues/8010

self.addEventListener('push', function(event) {
    console.log('dag365: Push event mottagen', event);

    let payload;
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        payload = {};
    }

    // Läs från data-fältet (data-only meddelanden) med fallback till notification (legacy)
    const data = payload.data || {};
    const notification = payload.notification || {};

    const notificationTitle = data.title || notification.title || 'dag365';
    const notificationOptions = {
        body: data.body || notification.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'dag365-notification',
        vibrate: [200, 100, 200],
        data: data,
        // OBS: actions stöds inte på iOS Safari, men skadar inte att ha med
        actions: [
            { action: 'open', title: 'Öppna dag365' },
            { action: 'dismiss', title: 'Stäng' }
        ]
    };

    // KRITISKT: Använd event.waitUntil() - detta är vad som krävs för iOS!
    event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
    );
});

// Hantera klick på notis
self.addEventListener('notificationclick', (event) => {
    console.log('dag365: Notis klickad', event);
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes('dag365') && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// ===== CACHING FÖR OFFLINE =====
const CACHE_NAME = 'dag365-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install - cacha statiska resurser
self.addEventListener('install', (event) => {
    console.log('dag365: Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('dag365: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate - rensa gamla cacher
self.addEventListener('activate', (event) => {
    console.log('dag365: Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('dag365: Removing old cache', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignorera Firebase och externa API-anrop för caching
    if (url.hostname !== location.hostname) {
        return;
    }

    // För statiska resurser - network first, fallback cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
