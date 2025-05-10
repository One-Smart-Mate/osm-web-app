// firebaseMessaging.ts
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";
import { NOTIFICATIONS_KEY } from "../utils/hooks/usePushNotifications";
import { isArray } from "lodash";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const messaging = getMessaging(app);

export const requestPermissionAndGetToken = async (): Promise<string | null> => {
    console.log('[Firebase Messaging] Requesting notification permissions');
    // 1. Request permission for notifications
    const permission = await Notification.requestPermission();
    console.log('[Firebase Messaging] Permission status:', permission);
    
    if (permission !== "granted") {
      console.warn('[Firebase Messaging] Notification permission denied');
      return null;
    }
    
    try {
      console.log('[Firebase Messaging] Registering service worker...');
      // Manually register the service worker
      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js',{scope:'/'});
      console.log('[Firebase Messaging] Service worker registered:', swRegistration);

      console.log('[Firebase Messaging] Getting token with VAPID key:', VAPID_KEY ? 'VAPID key present' : 'VAPID key missing');
      // Pass the reference of the registered SW to getToken
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration
      });

      if (currentToken) {
        console.log('[Firebase Messaging] Token obtained:', currentToken);
        return currentToken;
      } else {
        console.warn('[Firebase Messaging] Could not obtain token');
        return null;
      }
    } catch (error) {
      console.error('[Firebase Messaging] Error obtaining token:', error);
      return null;
    }
  };

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('[Main App] Foreground message received:', payload);
      handleSavePushNotification(payload);
      resolve(payload);
    });
  });

  export const listenForBackgroundMessages = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_MESSAGE') {
          const payload = event.data.payload;
          handleSavePushNotification(payload);
          console.log('[Main App] Background message received:', payload);
        }
      });
    }
  };


  const handleSavePushNotification = (payload: any) => {
    const storedNotifications = sessionStorage.getItem(NOTIFICATIONS_KEY);
    const localNotifications =  storedNotifications ? JSON.parse(storedNotifications) : [];
    if(isArray(localNotifications)) {
      localNotifications.push({
        title: payload?.data?.notification_title ?? payload?.notification?.title,
        body: payload?.data?.notification_description ?? payload?.notification?.body
      });
      sessionStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(localNotifications));
    }  else {
      const newArray = [];
      newArray.push({
        title: payload?.data?.notification_title ?? payload?.notification?.title,
        body: payload?.data?.notification_description ?? payload?.notification?.body
      });
      sessionStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(localNotifications));
    }
  }