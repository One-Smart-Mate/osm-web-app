import React, { useEffect } from 'react';
import { notification } from 'antd';
import { onMessageListener } from '../config/firebaseMessaging';
import Strings from '../utils/localizations/Strings';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    notification_title?: string;
    notification_description?: string;
  };
}

const NotificationHandler: React.FC = () => {
  useEffect(() => {
    console.log('[NotificationHandler] Initializing notification handler');
    
    // Function to handle received notifications
    const handleNotification = async () => {
      try {
        console.log('[NotificationHandler] Setting up message listener');
        const payload = await onMessageListener() as NotificationPayload;
        console.log('[NotificationHandler] Notification received:', payload);
        
        // Extract title and body from notification
        let title = payload.notification?.title;
        let body = payload.notification?.body;
        
        // If they don't exist, use alternative data
        if (!title || !body) {
          title = payload.data?.notification_title || Strings.defaultNotificationTitle;
          body = payload.data?.notification_description || Strings.defaultNotificationMessage;
        }
        
        // Show notification using Ant Design
        notification.open({
          message: title,
          description: body,
          placement: 'topRight',
          duration: 5,
        });
        
        console.log('[NotificationHandler] Notification displayed:', { title, body });
      } catch (error) {
        console.error('[NotificationHandler] Error processing notification:', error);
      }
    };
    
    // Set up the listener
    handleNotification();
    
    // Set up an interval to check for new notifications
    const interval = setInterval(handleNotification, 60000); // Every minute
    
    return () => {
      clearInterval(interval);
      console.log('[NotificationHandler] Cleaning up notification handler');
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default NotificationHandler;
