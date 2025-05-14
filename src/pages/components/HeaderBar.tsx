import React from "react";
import NotificationDropdown from "./NotificationDropdown";
import UserProfileDropdown from "./UserProfileDropdown";
import User from "../../data/user/user";
import LanguageDropdown from "./LanguageDropdown";
import { Switch, theme } from "antd";
import Constants from "../../utils/Constants";

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
      <div style={{ width: 200, marginRight: "20px", marginLeft: "20px" }}>
        <LanguageDropdown />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Switch
          checked={isDarkMode}
          checkedChildren="Dark mode"
          unCheckedChildren="Light mode"
          style={{ marginRight: 10 }}
          onChange={toggleDarkMode}
        />

        <NotificationDropdown />
        <div style={{ marginLeft: "20px" }}>
          <UserProfileDropdown user={user} />
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
