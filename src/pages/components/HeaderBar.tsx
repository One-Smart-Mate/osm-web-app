import React from "react";
import NotificationDropdown from "./NotificationDropdown";
import UserProfileDropdown from "./UserProfileDropdown";
import User from "../../data/user/user";
import LanguageDropdown from "./LanguageDropdown";
import { Switch, theme, Button } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import Constants from "../../utils/Constants";
import { useAppDispatch, useAppSelector } from "../../core/store";
import { selectIsSessionLocked, toggleSessionLock } from "../../core/genericReducer";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderBarProps {
  user: User;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  sidebarWidth,
  isSidebarCollapsed,
  user,
}) => {
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isSessionLocked = useAppSelector(selectIsSessionLocked);
  
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    const storedMode = localStorage.getItem(Constants.SESSION_KEYS.darkMode);
    return storedMode ? JSON.parse(storedMode) : false;
  });

  const toggleDarkMode = (enabled: boolean) => {
    if (isSessionLocked) return; // Prevent toggle when locked
    
    const body = document.body;
    body.classList.add("fade-out");
    console.log("Dark mode enabled:", enabled);
    localStorage.setItem(
      Constants.SESSION_KEYS.darkMode,
      JSON.stringify(enabled)
    );
    setIsDarkMode(enabled);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleLockSession = () => {
    dispatch(toggleSessionLock());
    
    if (!isSessionLocked) {
      // Locking session - navigate to TagsFastPassword
      const targetPath = `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.tagsFastPassword}`;
      navigate(targetPath, {
        state: location.state // Preserve current location state
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        background: "#fff",
        height: "64px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        width: `calc(100% - ${isSidebarCollapsed ? 80 : sidebarWidth}px)`,
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 1000,
        transition: "width 0.2s ease",
        backgroundColor: token.colorBgContainer,
        opacity: isSessionLocked ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div 
          style={{ 
            width: 140, 
            marginRight: "10px", 
            marginLeft: "20px",
            pointerEvents: isSessionLocked ? 'none' : 'auto',
            opacity: isSessionLocked ? 0.5 : 1
          }}
        >
          <LanguageDropdown />
        </div>
        <Button 
          type={isSessionLocked ? "primary" : "text"}
          icon={isSessionLocked ? <UnlockOutlined /> : <LockOutlined />}
          onClick={handleLockSession}
          style={{ 
            color: isSessionLocked ? token.colorWhite : token.colorText,
            background: isSessionLocked ? token.colorPrimary : 'transparent',
            border: isSessionLocked ? `1px solid ${token.colorPrimary}` : 'none',
            boxShadow: isSessionLocked ? token.boxShadow : 'none',
            padding: '0 12px'
          }}
          className="lock-session-button"
        >
          <span style={{ textDecoration: 'none' }}>
            {isSessionLocked ? 'Reanudar Sesión' : 'Bloquear Sesión'}
          </span>
        </Button>
      </div>

      <div 
        style={{ 
          display: "flex", 
          alignItems: "center",
          pointerEvents: isSessionLocked ? 'none' : 'auto',
          opacity: isSessionLocked ? 0.5 : 1
        }}
      >
        <Switch
          checked={isDarkMode}
          checkedChildren="Dark mode"
          unCheckedChildren="Light mode"
          style={{ marginRight: 10 }}
          onChange={toggleDarkMode}
          disabled={isSessionLocked}
        />

        <div style={{ pointerEvents: isSessionLocked ? 'none' : 'auto' }}>
          <NotificationDropdown />
        </div>
        <div 
          style={{ 
            marginLeft: "20px",
            pointerEvents: isSessionLocked ? 'none' : 'auto'
          }}
        >
          <UserProfileDropdown user={user} />
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
