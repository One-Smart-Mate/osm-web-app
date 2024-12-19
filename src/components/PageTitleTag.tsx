import React from 'react';
import {theme } from 'antd';

const { useToken } = theme;

interface Props {
  mainText: string;
  subText?: string;
}
const PageTitleCards: React.FC<Props> = ({ mainText, subText }) => {
  const { token } = useToken();  // Se obtiene el token en PageTitleCards

  // Usamos el color primario del tema
  const primaryColor = token.colorPrimary;

  return (
    <h1 className="text-3xl md:text-4xl font-semibold text-black">
      {mainText}{" "}
      <span className="font-bold" style={{ color: primaryColor }}>
        {subText}
      </span>
    </h1>
  );
};

export default PageTitleCards;
