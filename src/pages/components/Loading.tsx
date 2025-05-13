// Loading.tsx
import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  return (
    <>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: window.screen.availHeight * 0.7, width:'100%' }}>
          <Spin size="large" />
        </div>
      ) : null}
    </>
  );
};

export default Loading;
