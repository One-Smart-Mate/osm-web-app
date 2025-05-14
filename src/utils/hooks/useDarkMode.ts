import { useState, useEffect } from 'react';
import Constants from '../Constants';

/**
 * Custom hook to check if the app is in dark mode or not.
 * @returns {boolean} isDarkMode - The current dark mode state.
 */
const useDarkMode = (): boolean => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const storedMode = localStorage.getItem(Constants.SESSION_KEYS.darkMode);
    setIsDarkMode(storedMode ? JSON.parse(storedMode) : false);
  }, []);

  return isDarkMode;
};

export default useDarkMode;
