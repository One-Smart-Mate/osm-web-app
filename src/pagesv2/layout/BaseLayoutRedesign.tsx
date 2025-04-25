import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  theme,
  message,
  Card,
} from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Outlet, useLocation } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import { useAppSelector } from "../../core/store";
import { selectCurrentUser } from "../../core/authReducer";
import NotificationHandler from "../../components/NotificationHandler";
import HeaderV2 from "../componentsV2/HeaderV2";
import SideBarV2 from "../componentsV2/SideBarV2";

const { Header, Content } = Layout;

const BaseLayoutRedesign: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();
  const [selectedPath, setSelectedPath] = useState("");
  const [isCollapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, },
  } = theme.useToken();
;

  const sidebarWidth = 250;
  const collapsedWidth = 80;

  useEffect(() => {
    setSelectedPath(location.pathname + location.search);
    console.log(selectedPath)
  }, [location]);

  const toggleCollapse = () => setCollapsed(!isCollapsed);

  const handleLogout = () => {
    message.success("Has cerrado sesión exitosamente.");
  };

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
      <HeaderV2
        user={user}
        avatarSrc="..."
        sidebarWidth={sidebarWidth}
        isSidebarCollapsed={isCollapsed}
        onLogout={handleLogout}
      />

      <SideBarV2 collapsed={isCollapsed} toggleCollapse={toggleCollapse} />

      <Layout
        style={{
          marginLeft: isCollapsed ? collapsedWidth : sidebarWidth,
          width: `calc(100vw - ${
            isCollapsed ? collapsedWidth : sidebarWidth
          }px)`,
        }}
      >
        <Header
          style={{ background: colorBgContainer }}
          className="d-flex justify-between"
        >
          <Button
            type="text"
            icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
          />
        </Header>
        <Content className="p-2 mt-3 ml-3 mr-3 flex-grow overflow-auto">
          <span className="absolute bottom-0 right-8 text-xs md:text-sm">
            {Strings.tagVersion}
          </span>
          <div className="layout-content h-full w-full">
            <Card>
              <Outlet />
            </Card>
          </div>
        </Content>
        <div className="hidden">
          <NotificationHandler />
        </div>
      </Layout>
    </Layout>
  );
};

export default BaseLayoutRedesign;
