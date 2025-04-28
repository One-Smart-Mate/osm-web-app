import React, { useEffect } from "react";
import { notification } from "antd";
import { onMessageListener, listenForBackgroundMessages } from "../config/firebaseMessaging";
import { usePushNotifications } from "../utils/hooks/usePushNotifications";

const NotificationHandler: React.FC = () => {
  const { addNotification } = usePushNotifications();

  useEffect(() => {
    console.log("[NotificationHandler] Initializing notification handler");

    // Function to display notifications
    const displayNotification = (payload: any) => {
      console.log("[NotificationHandler] Notification received:", payload);

      // Add the notification to the array
      addNotification(payload);

      // Extract title and body from notification
      const title = payload.notification?.title || "Default Title";
      const body = payload.notification?.body || "Default Message";

      // Show notification using Ant Design
      notification.open({
        message: title,
        description: body,
        placement: "topRight",
        duration: 5,
      });
    };

    // Listen for foreground notifications
    onMessageListener()
      .then((payload) => {
        displayNotification(payload);
      })
      .catch((error) => {
        console.error("[NotificationHandler] Error processing foreground notification:", error);
      });

    // Listen for background notifications
    listenForBackgroundMessages();

    return () => {
      console.log("[NotificationHandler] Cleaning up notification handler");
    };
  }, [addNotification]);

  return null; // This component doesn't render anything visible
};

export default NotificationHandler;
