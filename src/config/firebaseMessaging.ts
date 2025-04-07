// firebaseMessaging.ts
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const messaging = getMessaging(app);

export const requestPermissionAndGetToken = async (): Promise<string | null> => {
    // 1. Request permission for notifications
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }
    try {
      // Manually register the service worker
      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Pass the reference of the registered SW to getToken
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration
      });

      if (currentToken) {
        return currentToken;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
