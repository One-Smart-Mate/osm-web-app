import React, { useState } from "react";
import { Layout, message } from "antd";
import HeaderComponent from "../ComponentsV2/HeaderV2";
import Sidebar from "../ComponentsV2/SideBarV2";
import MainContent from "../MainContent";
import { ContentType, menuMap } from "../menuConfig";

const BaseLayoutV2: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentType>("home");

  const sidebarWidth = 250;
  const collapsedWidth = 80;

  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleLogout = () => {
    message.success("Has cerrado sesión exitosamente.");
    // lógica adicional si quieres
  };

  const handleSidebarClick = (contentType: string) => {
    if (contentType in menuMap) {
      setCurrentContent(contentType as ContentType);
    } else {
      setCurrentContent("home");
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <HeaderComponent
        userName="John Doe"
        avatarSrc="..."
        sidebarWidth={sidebarWidth}
        isSidebarCollapsed={collapsed}
        onLogout={handleLogout}
      />
        
      <Sidebar
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
        onSideBarV2Click={handleSidebarClick}
      />
      
      <Layout style={{ marginLeft: collapsed ? collapsedWidth : sidebarWidth, width: `calc(100vw - ${collapsed ? collapsedWidth : sidebarWidth}px)` }}>
        <MainContent
          collapsed={collapsed}
          currentContent={currentContent}
          sidebarWidth={sidebarWidth}
          collapsedWidth={collapsedWidth}
        />
      </Layout>
    </Layout>
  );
};

export default BaseLayoutV2;
