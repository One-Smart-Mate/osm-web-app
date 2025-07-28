import { useEffect, useRef } from 'react';
import { useUpdateLastLoginMutation } from '../../services/authService';
import useCurrentUser from './useCurrentUser';
import Constants from '../Constants';

// Lightweight version of user activity tracking
// Only tracks on focus/blur and periodic checks
const useUserActivityLite = () => {
  const { user } = useCurrentUser();
  const [updateLastLogin] = useUpdateLastLoginMutation();
  const lastUpdateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateUserActivity = async () => {
    if (!user?.userId) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Only update if it's been more than 15 minutes since last update
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    
    if (timeSinceLastUpdate < FIFTEEN_MINUTES) {
      return;
    }

    try {
      // Detect user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      await updateLastLogin({
        userId: Number(user.userId),
        date: new Date().toISOString(), // Send as ISO string to match backend example
        platform: Constants.OS_WEB,
        timezone: userTimezone
      }).unwrap();
      
      lastUpdateRef.current = now;
    } catch (error) {
      console.error('[UserActivityLite] Error updating user activity:', error);
    }
  };

  useEffect(() => {
    if (!user?.userId) return;

    // Update activity immediately when hook is initialized
    updateUserActivity();

    // Set up periodic check every 10 minutes when document is visible
    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          updateUserActivity();
        }
      }, 10 * 60 * 1000); // 10 minutes
    };

    setupInterval();

    // Handle focus/blur for basic activity detection
    const handleFocus = () => updateUserActivity();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateUserActivity();
        setupInterval();
      } else {
        // Clear interval when tab is not visible
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.userId]);
};

export default useUserActivityLite; 