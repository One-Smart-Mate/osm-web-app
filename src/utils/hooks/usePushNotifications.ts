import { useState } from "react";

const NOTIFICATIONS_KEY = "appNotifications";

export const usePushNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>(() => {
    // Retrieve the notifications array from sessionStorage
    const storedNotifications = sessionStorage.getItem(NOTIFICATIONS_KEY);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  });

  const addNotification = (newNotification: any) => {
    console.log("addNotification: ", notifications);
    const updatedNotifications = notifications;
    updatedNotifications.push(newNotification.notification);

    setNotifications(updatedNotifications);

    // Save the updated array to sessionStorage
    sessionStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  };

  const clearNotifications = () => {
    setNotifications([]);
    sessionStorage.removeItem(NOTIFICATIONS_KEY);
  };

  return {
    notifications,
    addNotification,
    clearNotifications,
  };
};