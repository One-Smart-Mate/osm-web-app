import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import { Avatar, theme, Tooltip } from "antd";
import Constants from "../../utils/Constants";
import Strings from "../../utils/localizations/Strings";
import { buildRoute, getUserSiderOptions, navigateWithState } from "../../routes/RoutesExtensions";
import { useLocation } from "react-router-dom";



interface SideBarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
  collapsed,
  toggleCollapse,
}) => {
  const { token } = theme.useToken();
  const navigate = navigateWithState();
  const location = useLocation();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [getSessionUser] = useSessionStorage<User>(Constants.SESSION_KEYS.user);
  const user = getSessionUser();

  useEffect(() => {
    if (user) {
      const routes = getUserSiderOptions(user);
      setMenuItems(routes);
      setDefaultRoute();
    }
  }, []);

  const handleClick = useCallback(
    (item: any) => {
      setSelectedKey(item.key);
      navigate(buildRoute(item.key));
    },
    [navigate]
  );

  const handleToggleCollapse = () => {
    toggleCollapse();
  };

  const setDefaultRoute = () => {
    const defaultKey = location.pathname.split("/").filter(Boolean).pop() || "";
    setSelectedKey(defaultKey);
  };

  // Get just the sections
  const sections = useMemo(() => {
    const uniqueSections = new Set(menuItems.map((item) => item.section));
    return Array.from(uniqueSections);
  }, [menuItems]);

  return (
    <>
      {/* Toggle button */}
      <div
        style={{
          position: "fixed",
          top: 16,
          left: collapsed ? 80 : 250,
          zIndex: 1000,
          transition: "left 0.2s ease",
          padding: "0 10px",
          background: token.colorBgContainer,

        }}
      >
        {collapsed ? (
          <MenuUnfoldOutlined
            style={{
              fontSize: 20,
              cursor: 'pointer',
              color: token.colorPrimaryHover,
            }}
            onClick={handleToggleCollapse}
          />
        ) : (
          <MenuFoldOutlined
            style={{ 
              fontSize: 20, 
              cursor: 'pointer',
              color: token.colorText,
            }}
            onClick={handleToggleCollapse}
          />
        )}
      </div>

      {/* SideBarV2 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: collapsed ? 80 : 250,
          background: token.colorBgContainer,
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
          transition: "width 0.2s ease",
          overflow: "auto",
        }}
      >

        
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: "0 24px",
          }}
        >
          <Avatar src={<img src={location.state?.siteLogo || user?.logo} alt="avatar" />} size={"large"} />
          {!collapsed && (
            <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 8 }}>
              {location.state?.siteName || user?.companyName}
            </span>
          )}
        </div>

        <div style={{ marginTop: 20, paddingBottom: 40 }}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!collapsed && (
                <div
                  style={{
                    padding: "10px 20px",
                    fontSize: 12,
                    color: "#8C8C8C",
                  }}
                >
                  {section}
                </div>
              )}
              {menuItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <Tooltip
                    key={item.key}
                    title={collapsed ? item.label : undefined}
                    placement="right"
                  >
                    <div
                      key={item.key}
                      onClick={() => handleClick(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 20px",
                        cursor: 'pointer',
                        transition: "background 0.2s",
                        background:
                          selectedKey === item.key
                            ? token.colorLinkActive
                            : "transparent",
                        position: "relative",
                        color: token.colorText,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedKey !== item.key) {
                          (e.currentTarget as HTMLDivElement).style.background =
                            token.colorLinkHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedKey !== item.key) {
                          (e.currentTarget as HTMLDivElement).style.background =
                            "transparent";
                        }
                      }}
                    >
                      <span 
                        style={{ 
                          fontSize: 18
                        }}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span 
                          style={{ 
                            marginLeft: 15
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                      {selectedKey === item.key && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            backgroundColor: token.colorPrimaryHover,
                          }}
                        />
                      )}
                    </div>
                  </Tooltip>
                ))}
            </div>
          ))}
        </div>
        {!collapsed && (
          <div
            style={{
              padding: "10px 20px",
              fontSize: 12,
              color: "#8C8C8C",
              position: "absolute",
              bottom: 10,
            }}
          >
           {Strings.tagVersion}
          </div>
        )}
      </div>
    </>
  );
};

export default SideBar;
