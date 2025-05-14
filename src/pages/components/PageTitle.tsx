import React, { useMemo } from 'react';
import { theme } from 'antd';
import useDarkMode from '../../utils/hooks/useDarkMode';

const { useToken } = theme;

interface Props {
  mainText: string;
  subText?: string;
}

// Modified to avoid issues with Ant Design's Typography component
const PageTitle: React.FC<Props> = ({ mainText, subText }) => {
  // Use memoization to prevent unnecessary re-renders
  const { token } = useToken();
  const isDarkMode = useDarkMode();
  
  // Memoize the primary color to prevent recalculation on each render
  const primaryColor = useMemo(() => token.colorPrimary, [token.colorPrimary]);
  
  const textClass = isDarkMode ? 'text-white' : '';
  
  return (
    <h3 className={`text-base md:text-2xl sm:text-1xl font-semibold ${textClass}`}>
      {mainText}{" "}
      {subText && (
        <span className="font-bold" style={{ color: primaryColor }}>
          {subText}
        </span>
      )}
    </h3>
  );
};
export default PageTitle;
