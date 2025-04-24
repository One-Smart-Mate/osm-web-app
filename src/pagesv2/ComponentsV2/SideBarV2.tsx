import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { getUserSiderOptionsV2 } from "../../pagesv2/RoutesV2"; // Importa las rutas dinámicas
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";

interface SideBarV2Props {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const SideBarV2: React.FC<SideBarV2Props> = ({ collapsed, toggleCollapse }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getSessionUser() as User;
    const routes = getUserSiderOptionsV2(user);
    setMenuItems(routes);
  }, [getSessionUser]);

  const handleClick = (item: any) => {
    setSelectedKey(item.key);
    navigate(item.fullPath); // Navega a la ruta correspondiente
  };

  // Función para obtener las secciones únicas
  const getSections = () => {
    const sections = new Set(menuItems.map(item => item.section));
    return Array.from(sections);
  };

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
            style={{ fontSize: 20, cursor: "pointer", color: "#1890ff" }}
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
          <DashboardOutlined style={{ fontSize: 28, color: "#1890ff" }} />
          {!collapsed && (
            <span style={{ fontSize: 20, fontWeight: 600, marginLeft: 10 }}>
              Mantis
            </span>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          {getSections().map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!collapsed && (
                <div style={{ padding: "10px 20px", fontWeight: 600, color: "#888" }}>
                  {section}
                </div>
              )}
              {menuItems
                .filter(item => item.section === section)
                .map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleClick(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 20px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      background: selectedKey === item.key ? "#e6f7ff" : "transparent",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedKey !== item.key) {
                        (e.currentTarget as HTMLDivElement).style.background = "#e6f7ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedKey !== item.key) {
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      }
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    {!collapsed && <span style={{ marginLeft: 15 }}>{item.label}</span>}
                    {selectedKey === item.key && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          backgroundColor: "#1890ff",
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideBarV2;
