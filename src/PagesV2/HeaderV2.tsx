import React from 'react';
import { Input } from 'antd';
import NotificationDropdown from './NotificationDropdown'; 
import UserProfileDropdown from './UserProfileDropdown'; 

interface HeaderProps {
  userName: string;
  avatarSrc: string;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  onLogout: () => void; // Función para manejar el logout
}

const HeaderV2: React.FC<HeaderProps> = ({ userName, avatarSrc, sidebarWidth, isSidebarCollapsed, onLogout }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      background: '#fff',
      height: '64px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      width: `calc(100% - ${isSidebarCollapsed ? 80 : sidebarWidth}px)`,
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 1000,
      transition: 'width 0.2s ease'
    }}>
      <Input.Search
        placeholder="Buscar..."
        style={{ width: 200, marginRight: '20px', marginLeft: '20px' }}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NotificationDropdown />
        <div style={{ marginLeft: '20px' }}>
          <UserProfileDropdown />
        </div>
      </div>
    </div>
  );
};

export default HeaderV2;
