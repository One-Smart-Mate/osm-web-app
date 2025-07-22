import { useEffect, useRef, useCallback } from 'react';
import { useUpdateLastLoginMutation } from '../../services/authService';
import useCurrentUser from './useCurrentUser';
import Constants from '../Constants';

// requestIdleCallback is already defined in lib.dom.d.ts, no need to redeclare

// Hook to track user activity and update last activity timestamp
const useUserActivity = () => {
  const { user } = useCurrentUser();
  const [updateLastLogin] = useUpdateLastLoginMutation();
  const lastUpdateRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef<boolean>(true);

  // Reduced activity events for better performance
  const activityEvents = [
    'mousedown',
    'keydown',
    'touchstart',
    'click'
  ];

  const updateUserActivity = useCallback(async () => {
    if (!user?.userId || !isActiveRef.current) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Only update if it's been more than 10 minutes since last update (increased from 5)
    const TEN_MINUTES = 10 * 60 * 1000;
    
    if (timeSinceLastUpdate < TEN_MINUTES) {
      return;
    }

    try {
      // Use requestIdleCallback if available for better performance
      const sendUpdate = async () => {
        // Detect user's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        await updateLastLogin({
          userId: Number(user.userId),
          date: new Date().toISOString(),
          platform: Constants.OS_WEB,
          timezone: userTimezone
        }).unwrap();
        
        lastUpdateRef.current = now;
      };

      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => sendUpdate());
      } else {
        await sendUpdate();
      }
    } catch (error) {
      console.error('[UserActivity] Error updating user activity:', error);
    }
  }, [user?.userId, updateLastLogin]);

  const handleActivity = useCallback(() => {
    if (!isActiveRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Increased debounce time to 3 seconds for better performance
    timeoutRef.current = setTimeout(() => {
      updateUserActivity();
    }, 3000);
  }, [updateUserActivity]);

  useEffect(() => {
    if (!user?.userId) {
      isActiveRef.current = false;
      return;
    }

    isActiveRef.current = true;

    // Add event listeners for activity detection with passive option for better performance
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true, capture: true });
    });

    // Update activity immediately when hook is initialized
    updateUserActivity();

    // Cleanup function
    return () => {
      isActiveRef.current = false;
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user?.userId, handleActivity, updateUserActivity]);

  // Update activity when the user comes back to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.userId && isActiveRef.current) {
        updateUserActivity();
      } else if (document.hidden) {
        // Clear timeout when tab becomes inactive to save resources
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.userId, updateUserActivity]);
};

export default useUserActivity; 