import React, { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import UserProfileDropdown from "./UserProfileDropdown";
import User from "../../data/user/user";
import LanguageDropdown from "./LanguageDropdown";
import { Switch, theme, Button, Modal } from "antd";
import { LockOutlined, UnlockOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import Constants from "../../utils/Constants";
import Strings from "../../utils/localizations/Strings";
import { useAppDispatch, useAppSelector } from "../../core/store";
import { selectIsSessionLocked, setSessionLocked } from "../../core/genericReducer";
import { logOut } from "../../core/authReducer";
import { useSessionStorage } from "../../core/useSessionStorage";
// import { useNavigate } from "react-router-dom"; // Not needed, using window.location.href
import FastLoginModal from "./FastLoginModal";

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
  const isSessionLocked = useAppSelector(selectIsSessionLocked);
  const [showFastLoginModal, setShowFastLoginModal] = useState(false);
  const [, , clearSessionUser] = useSessionStorage(Constants.SESSION_KEYS.user);
  
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    const storedMode = localStorage.getItem(Constants.SESSION_KEYS.darkMode);
    return storedMode ? JSON.parse(storedMode) : false;
  });

  const toggleDarkMode = (enabled: boolean) => {
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
    if (isSessionLocked) {
      // If already locked, show fast login modal directly
      setShowFastLoginModal(true);
    } else {
      // Show confirmation modal
      Modal.confirm({
        title: Strings.sessionLockConfirmTitle,
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>{Strings.sessionLockConfirmContent}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              {Strings.sessionLockConfirmDescription}
            </p>
          </div>
        ),
        okText: Strings.blockButton,
        cancelText: Strings.cancel,
        okType: 'danger',
        onOk: () => {
          handleSessionLock();
        },
        onCancel: () => {
          // Do nothing, just close the modal
        },
      });
    }
  };

  const handleSessionLock = () => {
    // Clear user session
    clearSessionUser();
    dispatch(logOut(null));
    
    // Set session as locked
    dispatch(setSessionLocked(true));
    
    // Show fast login modal persistently
    setShowFastLoginModal(true);
  };

  const handleFastLoginSuccess = () => {
    console.log("🔍 HeaderBar handleFastLoginSuccess called");
    
    // Close the modal first
    setShowFastLoginModal(false);
    
    // Redirect to charts with full page reload to ensure fresh state
    const chartsUrl = `${window.location.origin}/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.charts}`;
    console.log("🔍 Redirecting to:", chartsUrl);
    console.log("🔍 Current session locked state:", isSessionLocked);
    
    // Small delay to ensure modal closes and state is updated
    setTimeout(() => {
      console.log("🔍 Executing redirect to charts...");
      window.location.href = chartsUrl;
    }, 300);
  };

  const handleFastLoginCancel = () => {
    // For locked sessions, don't allow cancel - modal stays open
    if (isSessionLocked) {
      return;
    }
    
    setShowFastLoginModal(false);
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
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div 
          style={{ 
            width: 140, 
            marginRight: "10px", 
            marginLeft: "20px"
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
            {isSessionLocked ? Strings.unlockSession : Strings.lockSession}
          </span>
        </Button>
      </div>

      <div 
        style={{ 
          display: "flex", 
          alignItems: "center"
        }}
      >
        <Switch
          checked={isDarkMode}
          checkedChildren="Dark mode"
          unCheckedChildren="Light mode"
          style={{ marginRight: 10 }}
          onChange={toggleDarkMode}
        />

        <div>
          <NotificationDropdown />
        </div>
        <div 
          style={{ 
            marginLeft: "20px"
          }}
        >
          <UserProfileDropdown user={user} />
        </div>
      </div>

      {/* Fast Login Modal */}
      <FastLoginModal
        isVisible={showFastLoginModal}
        onSuccess={handleFastLoginSuccess}
        onCancel={handleFastLoginCancel}
      />
    </div>
  );
};

export default HeaderBar;
