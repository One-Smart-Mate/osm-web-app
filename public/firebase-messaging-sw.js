// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-messaging-compat.js');
importScripts('/firebase-config.js');

console.log('[Firebase SW] Service Worker initialized');
console.log('[Firebase SW] Configuration loaded:', firebaseConfig);

try {
  firebase.initializeApp(firebaseConfig);
  console.log('[Firebase SW] Firebase initialized successfully');
  
  const messaging = firebase.messaging();
    console.log('[Firebase SW] Messaging initialized');

  messaging.onBackgroundMessage((payload) => {
    console.log('[Firebase SW] Background message received:', payload);

    // 1. Try to read payload.notification first
    let title = payload.notification?.title;
    let body = payload.notification?.body;
    console.log('[Firebase SW] Notification data:', { title, body });

    // 2. If they don't exist (or are empty), use payload.data
    if (!title || !body) {
      title = payload.data?.notification_title || 'Default Title';
      body = payload.data?.notification_description || 'Default Message';
      console.log('[Firebase SW] Using fallback data:', { title, body });
    }

    console.log('[Firebase SW] Showing notification:', { title, body });
    self.registration.showNotification(title, body);
  });

  // Verify if the service worker is registered correctly
  self.addEventListener('activate', event => {
    console.log('[Firebase SW] Service Worker activated');
  });

  self.addEventListener('install', event => {
    console.log('[Firebase SW] Service Worker installed');
  });

  self.addEventListener('push', event => {
    console.log('[Firebase SW] Push received:', event);
  });
} catch (error) {
  console.error('[Firebase SW] Error initializing Firebase:', error);
}
