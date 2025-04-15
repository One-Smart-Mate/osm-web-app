import React from "react";
import {
  DashboardOutlined,
  LoginOutlined,
  FormOutlined,
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  FileSearchOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { ContentType } from "./type";

interface SideBarV2Props {
  collapsed: boolean;
  toggleCollapse: () => void;
  onSideBarV2Click: (contentType: ContentType) => void;
}

const SideBarV2: React.FC<SideBarV2Props> = ({ collapsed, toggleCollapse, onSideBarV2Click }) => {
  const menuItems = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard", section: "Navigation" },
    { key: "login", icon: <LoginOutlined />, label: "Login", section: "Authentication" },
    { key: "register", icon: <FormOutlined />, label: "Register", section: "Authentication" },
    { key: "typography", icon: <FontSizeOutlined />, label: "Typography", section: "Utilities" },
    { key: "color", icon: <BgColorsOutlined />, label: "Color", section: "Utilities" },
    { key: "shadow", icon: <BarcodeOutlined />, label: "Shadow", section: "Utilities" },
    { key: "sample", icon: <FileSearchOutlined />, label: "Sample Page", section: "Support" },
    { key: "docs", icon: <QuestionCircleOutlined />, label: "Documentation", section: "Support" },
  ];

  const handleClick = (key: string) => {
    onSideBarV2Click(key as ContentType);
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
          {menuItems.map(({ key, icon, label, section }, index) => (
            <React.Fragment key={key}>
              {index === 0 || menuItems[index - 1].section !== section ? (
                <div style={{ padding: "10px 20px", fontWeight: 600, color: "#888" }}>
                  {section}
                </div>
              ) : null}
              <div
                onClick={() => handleClick(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {!collapsed && <span style={{ marginLeft: 15 }}>{label}</span>}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideBarV2;
