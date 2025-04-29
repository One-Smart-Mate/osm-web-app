import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import {
  buildRoute,
  getUserSiderOptionsV2,
  navigateWithState,
} from "../routes/RoutesExtensions";
import { Avatar, theme, Tooltip } from "antd";

interface SideBarV2Props {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const SideBarRedesign: React.FC<SideBarV2Props> = ({
  collapsed,
  toggleCollapse,
}) => {
  const { token } = theme.useToken();
  const navigate = navigateWithState();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);
  const user = getSessionUser();

  useEffect(() => {
    if (user) {
      const routes = getUserSiderOptionsV2(user);
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
          background: "#fff",
        }}
      >
        {collapsed ? (
          <MenuUnfoldOutlined
            style={{
              fontSize: 20,
              cursor: "pointer",
              color: token.colorPrimaryHover,
            }}
            onClick={toggleCollapse}
          />
        ) : (
          <MenuFoldOutlined
            style={{ fontSize: 20, cursor: "pointer" }}
            onClick={toggleCollapse}
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
          background: "#fff",
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
          transition: "width 0.2s ease",
          overflow: "hidden",
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
          <Avatar src={<img src={user?.logo} alt="avatar" />} size={"large"} />
          {!collapsed && (
            <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 8 }}>
              {user?.companyName}
            </span>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
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
                        cursor: "pointer",
                        transition: "background 0.2s",
                        background:
                          selectedKey === item.key
                            ? token.colorPrimaryBgHover
                            : "transparent",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedKey !== item.key) {
                          (e.currentTarget as HTMLDivElement).style.background =
                            "#e6f7ff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedKey !== item.key) {
                          (e.currentTarget as HTMLDivElement).style.background =
                            "transparent";
                        }
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      {!collapsed && (
                        <span style={{ marginLeft: 15 }}>{item.label}</span>
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
            1.1.28-dev
          </div>
        )}
      </div>
    </>
  );
};

export default SideBarRedesign;
