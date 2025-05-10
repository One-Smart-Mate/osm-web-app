import { useState } from "react";

export const NOTIFICATIONS_KEY = "appNotifications";

export const usePushNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>(() => {
    // Retrieve the notifications array from sessionStorage
    const storedNotifications = sessionStorage.getItem(NOTIFICATIONS_KEY);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  });

  const clearNotifications = () => {
    setNotifications([]);
    sessionStorage.removeItem(NOTIFICATIONS_KEY);
  };

  return {
    notifications,
    clearNotifications,
  };
};