// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASURE_ID
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log("[Service worker info: ]", payload);

    // 1. Try to read payload.notification first
    let title = payload.notification?.title;
    let body = payload.notification?.body;


    // 2. If they don't exist (or are empty), use payload.data
    if (!title || !body) {
      title = payload.data?.notification_title || 'Default Title';
      body = payload.data?.notification_description || 'Default Message';
    }

    const notificationOptions = {
      body: body,
    };

    self.registration.showNotification(title, notificationOptions);
  });
