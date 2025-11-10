import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';
import { WifiOutlined, DisconnectOutlined, SyncOutlined } from '@ant-design/icons';
import Strings from '../../utils/localizations/Strings';

interface NetworkStatusBannerProps {
  className?: string;
}

/**
 * Global network status banner component
 * Shows a banner when the connection is lost and hides when reconnected
 */
const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[NetworkStatusBanner] Connection restored');
      setIsOnline(true);
      setIsReconnecting(false);

      // Keep the success banner visible for 3 seconds
      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
      }, 3000);
    };

    const handleOffline = () => {
      console.log('[NetworkStatusBanner] Connection lost');
      setIsOnline(false);
      setIsReconnecting(true);
      setShowBanner(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connection check (every 10 seconds when offline)
    const intervalId = setInterval(() => {
      const currentStatus = navigator.onLine;
      if (!currentStatus && isOnline) {
        handleOffline();
      } else if (currentStatus && !isOnline) {
        handleOnline();
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[1001] transition-all duration-300 ${className}`}
      style={{
        animation: showBanner ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out'
      }}
    >
      <style>
        {`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(-100%);
              opacity: 0;
            }
          }
        `}
      </style>

      {!isOnline ? (
        <Alert
          message={Strings.networkConnectionLost}
          description={
            isReconnecting ? (
              <span>
                <SyncOutlined spin className="mr-2" />
                {Strings.networkReconnecting}
              </span>
            ) : (
              Strings.networkCheckConnection
            )
          }
          type="error"
          showIcon
          icon={<DisconnectOutlined />}
          banner
          closable={false}
        />
      ) : (
        <Alert
          message={Strings.networkConnectionRestored}
          description={Strings.networkYouAreBackOnline}
          type="success"
          showIcon
          icon={<WifiOutlined />}
          banner
          closable
          onClose={() => setShowBanner(false)}
        />
      )}
    </div>
  );
};

export default NetworkStatusBanner;
