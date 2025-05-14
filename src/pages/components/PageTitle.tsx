import React, { useMemo } from 'react';
import { theme } from 'antd';

const { useToken } = theme;

interface Props {
  mainText: string;
  subText?: string;
}

// Modified to avoid issues with Ant Design's Typography component
const PageTitle: React.FC<Props> = ({ mainText, subText }) => {
  // Use memoization to prevent unnecessary re-renders
  const { token } = useToken();
  
  // Memoize the primary color to prevent recalculation on each render
  const primaryColor = useMemo(() => token.colorPrimary, [token.colorPrimary]);
  
  return (
    <h3 className="text-base md:text-2xl sm:text-1xl font-semibold text-black">
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
