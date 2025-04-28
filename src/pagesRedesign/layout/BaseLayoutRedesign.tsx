import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  theme,
  Card,
} from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Outlet, useLocation } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import { useAppSelector } from "../../core/store";
import { selectCurrentUser } from "../../core/authReducer";
import NotificationHandler from "../../components/NotificationHandler";
import SideBarRedesign from "../components/SideBarRedesign";
import HeaderRedesign from "../components/HeaderRedesign";
import { useSetAppTokenMutation } from "../../services/userService";
import { requestPermissionAndGetToken } from "../../config/firebaseMessaging";
import Constants from "../../utils/Constants";

const { Header, Content } = Layout;

const BaseLayoutRedesign: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();
  const [selectedPath, setSelectedPath] = useState("");
  const [isCollapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer }} = theme.useToken();
  const [setAppToken] = useSetAppTokenMutation();


  const sidebarWidth = 250;
  const collapsedWidth = 80;

  useEffect(() => {
    setSelectedPath(location.pathname + location.search);
    console.log(selectedPath)
  }, [location]);

  useEffect(() => {
    if (user && user.userId) {
          console.log('[BaseLayoutRedesign] Requesting Firebase token for user:', user.userId);
          requestPermissionAndGetToken().then((token) => {
            if (token) {
              // Convert user.userId to number and send it
              setAppToken({
                userId: Number(user.userId),
                appToken: token,
                osName: Constants.osName,
                osVersion: Constants.tagVersion,
              })
              .unwrap()
              .then(() => {
                console.log('[BaseLayoutRedesign] Token sent successfully to server');
              })
              .catch((error) => {
                console.error('[BaseLayoutRedesign] Error sending token to server:', error);
              });
            } else {
              console.warn('[BaseLayoutRedesign] Could not obtain Firebase token');
            }
          }).catch(error => {
            console.error('[BaseLayoutRedesign] Error requesting token:', error);
          });
        } else {
          console.log('[BaseLayoutRedesign] User not authenticated, token not requested');
        }
  }, [user, setAppToken]);

  const toggleCollapse = () => setCollapsed(!isCollapsed);

  
  return (
    <Layout style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
      <HeaderRedesign
        user={user}
        sidebarWidth={sidebarWidth}
        isSidebarCollapsed={isCollapsed}
      />

      <SideBarRedesign collapsed={isCollapsed} toggleCollapse={toggleCollapse} />

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
