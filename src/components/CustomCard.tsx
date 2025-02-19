import React from 'react';
import { Card } from 'antd';

interface CustomCardProps {
  title?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  [key: string]: any;  // Permite pasar cualquier otra prop válida de `Card`
}

const CustomCard: React.FC<CustomCardProps> = ({ title, extra, children, ...rest }) => {
  return (
    <Card bordered style={{ width: 300, borderRadius: 8, overflow: 'hidden' }} {...rest}>
      {(title || extra) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div>{children}</div>
    </Card>
  );
};

export default CustomCard;
