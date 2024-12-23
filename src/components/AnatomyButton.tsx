import React from 'react';
import { Button, theme } from 'antd';


const { useToken } = theme;


interface AnatomyButtonProps {
  title: string;
  onClick: () => void;
  type?: 'default' | 'danger' | 'outline' | 'text';
  size?: 'small' | 'middle' | 'large';
  className?: string;
}


const AnatomyButton: React.FC<AnatomyButtonProps> = ({
  title,
  onClick,
  type = 'default',
  size = 'middle',
  className = '',
}) => {
  // Obtener el color primario del tema global
  const { token } = useToken();
  const primaryColor = token.colorPrimary;


  // Establecer el tipo de botón y los estilos correspondientes
  const antType =
    type === 'danger' ? 'primary' : type === 'outline' ? 'default' : type;


  const buttonStyles: React.CSSProperties = {
    borderRadius: '9999px', // Esto asegura que el botón tenga bordes redondeados
    ...(type === 'danger' && {
      backgroundColor: 'red',
      borderColor: 'red',
      color: 'white',
    }),
    ...(type === 'default' && {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
      color: 'white',
    }),
    ...(type === 'outline' && {
      backgroundColor: 'transparent',
      borderColor: primaryColor,
      color: primaryColor,
    }),
    ...(type === 'text' && {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: primaryColor,
    }),
  };


  return (
    <Button
      type={antType}
      size={size}
      className={className}
      onClick={onClick}
      style={buttonStyles}
    >
      {title}
    </Button>
  );
};


export default AnatomyButton;
