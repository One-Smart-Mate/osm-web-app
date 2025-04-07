// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.17.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDylV3QjU-q6JlHV8AgrCm76kkwhqZXnCk",
  authDomain: "osm-dev-c2f20.firebaseapp.com",
  projectId: "osm-dev-c2f20",
  storageBucket: "osm-dev-c2f20.firebasestorage.app",
  messagingSenderId: "703295341497",
  appId: "1:703295341497:web:029e8ccccc597d95dd2c68",
  measurementId: "G-ML87MQMK6H"

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
