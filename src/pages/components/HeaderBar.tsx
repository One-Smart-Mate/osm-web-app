import React from "react";
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

  const handleLockSessionConfirm = () => {
    if (isSessionLocked) {
      // If already locked, modal is already showing in BaseLayout
      // Do nothing
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
    // Store last user info for display purposes
    localStorage.setItem('last_user_info', JSON.stringify({
      name: user.name,
      email: user.email,
      logo: user.logo
    }));

    // Mark session as locked persistently
    localStorage.setItem('session_locked', 'true');

    // Mark session as locked in Redux
    dispatch(setSessionLocked(true));

    // Force navigation to locked session page
    window.location.href = '/locked-session';
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
          onClick={handleLockSessionConfirm}
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

    </div>
  );
};

export default HeaderBar;