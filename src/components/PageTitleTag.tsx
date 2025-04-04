import React from 'react';
import { theme } from 'antd';

const { useToken } = theme;

interface Props {
  mainText: string;
  subText?: string;
}
const PageTitleTag: React.FC<Props> = ({ mainText, subText }) => {
  const { token } = useToken();  // The token is obtained in PageTitleCards


  // We use the primary color of the theme
  const primaryColor = token.colorPrimary;

  return (
    <h1 className="text-base md:text-3xl font-semibold text-black">
      {mainText}{" "}
      <span className="font-bold" style={{ color: primaryColor }}>
        {subText}
      </span>
    </h1>
  );
};

export default PageTitleTag;
