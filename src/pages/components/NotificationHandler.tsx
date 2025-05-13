import React, { useEffect } from "react";
import { notification } from "antd";
import { onMessageListener } from "../../config/firebaseMessaging";

const NotificationHandler: React.FC = () => {

  useEffect(() => {
    console.log("[NotificationHandler] Initializing notification handler");

    // Function to display notifications
    const displayNotification = (payload: any) => {
      console.log("[NotificationHandler] Notification received:", payload);
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

    return () => {
      console.log("[NotificationHandler] Cleaning up notification handler");
    };
  });

  return null; // This component doesn't render anything visible
};

export default NotificationHandler;
