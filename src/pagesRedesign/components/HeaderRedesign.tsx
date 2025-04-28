import React from 'react';
import NotificationDropdown from './NotificationDropdown';
import UserProfileDropdown from './UserProfileDropdown';
import User from '../../data/user/user';
import LanguageDropdown from '../../pages/layouts/LanguageDropdown';


interface HeaderProps {
  user: User;
  avatarSrc: string;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
}

const HeaderRedesign: React.FC<HeaderProps> = ({ sidebarWidth, isSidebarCollapsed, user }) => {
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
    
      <div style={{ width: 200, marginRight: '20px', marginLeft: '20px' }}>
        <LanguageDropdown />
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NotificationDropdown />
        <div style={{ marginLeft: '20px' }}>
          <UserProfileDropdown user={user} />
        </div>

      </div>
    </div>
  );
};

export default HeaderRedesign;
