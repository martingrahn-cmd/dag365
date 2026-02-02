// Firebase Messaging Service Worker för dag365
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

const messaging = firebase.messaging();

// Hantera bakgrundsnotiser
messaging.onBackgroundMessage((payload) => {
    console.log('dag365: Bakgrundsnotis mottagen', payload);

    const notificationTitle = payload.notification?.title || '🇸🇪 Sverige tävlar snart!';
    const notificationOptions = {
        body: payload.notification?.body || 'En svensk tävling börjar snart',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'os-notification',
        vibrate: [200, 100, 200],
        data: payload.data,
        actions: [
            { action: 'open', title: 'Öppna dag365' },
            { action: 'dismiss', title: 'Stäng' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Hantera klick på notis
self.addEventListener('notificationclick', (event) => {
    console.log('dag365: Notis klickad', event);
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Om dag365 redan är öppen, fokusera på den
                for (const client of clientList) {
                    if (client.url.includes('dag365') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Annars öppna ny flik
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
