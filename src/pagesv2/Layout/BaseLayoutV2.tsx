import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, theme, Avatar, MenuProps, message } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import { useAppSelector } from "../../core/store";
import { selectCurrentUser } from "../../core/authReducer";
import { getUserRol, RESPONSIVE_AVATAR, UserRoles } from "../../utils/Extensions";
import Routes, { UnauthorizedRoute } from "../../utils/Routes";
import NotificationHandler from "../../components/NotificationHandler";
import { requestPermissionAndGetToken } from "../../config/firebaseMessaging";
import { useSetAppTokenMutation } from "../../services/userService";
import Constants from "../../utils/Constants";
import HeaderComponent from "../ComponentsV2/HeaderV2";
import Sidebar from "../ComponentsV2/SideBarV2";
import MainContent from "../MainContent";
import { ContentType, menuMap } from "../menuConfig";
import { getUserSiderOptionsV2} from "../../pagesv2/RoutesV2";
import LanguageDropdown from "../../pages/layouts/LanguageDropdown";


const { Header, Sider, Content } = Layout;

interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}

const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const BaseLayoutV2: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPath, setSelectedPath] = useState("");
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);
  const [isCollapsed, setCollapsed] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentType>("home");
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [setAppToken] = useSetAppTokenMutation();
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);

  const sidebarWidth = 250;
  const collapsedWidth = 80;

  const validateRoute = () => {
    const route = location.pathname.split("/");
    const isAdminRoute = route[1] === Routes.AdminPrefix.substring(1);
    const isReceptionistRoute = route[1] === Routes.SysadminPrefix.substring(1);
    const user = getSessionUser() as User;
    const rol = getUserRol(user);
    if (isAdminRoute && (rol === UserRoles.LOCALSYSADMIN || rol === UserRoles.LOCALADMIN)) {
      navigate(UnauthorizedRoute, { replace: true });
    }
    if (isReceptionistRoute && rol === UserRoles.LOCALADMIN) {
      navigate(UnauthorizedRoute, { replace: true });
    }
  };

  useEffect(() => {
    setSelectedPath(location.pathname + location.search);
    validateRoute();
  }, [location]);

  useEffect(() => {
    if (user && user.userId) {
      console.log('[BaseLayout] Requesting Firebase token for user:', user.userId);
      requestPermissionAndGetToken().then((token) => {
        if (token) {
          console.log('[BaseLayout] Token obtained successfully, sending to server:', token.substring(0, 10) + '...');
          setAppToken({
            userId: Number(user.userId),
            appToken: token,
            osName: Constants.osName,
            osVersion: Constants.tagVersion,
          })
          .unwrap()
          .then(() => {
            console.log('[BaseLayout] Token sent successfully to server');
          })
          .catch((error) => {
            console.error('[BaseLayout] Error sending token to server:', error);
          });
        } else {
          console.warn('[BaseLayout] Could not obtain Firebase token');
        }
      }).catch(error => {
        console.error('[BaseLayout] Error requesting token:', error);
      });
    } else {
      console.log('[BaseLayout] User not authenticated, token not requested');
    }
  }, [user, setAppToken]);

  const handleOnClick = (data: any) => {
    const user = getSessionUser() as User;
    const rol = getUserRol(user);
    if (rol === UserRoles.IHSISADMIN) {
      navigate(data.key);
    } else {
      const siteInfo = data.keyPath[1];
      const siteId = siteInfo.split(" ")[0];
      const siteName = siteInfo.slice(siteId.length);
      navigate(data.key, {
        state: {
          companyId: user.companyId,
          companyName: user.companyName,
          siteName: siteName,
          siteId: siteId,
        },
      });
    }
  };

  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
      setStateOpenKeys(
        openKeys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      setStateOpenKeys(openKeys);
    }
  };

  const levelKeys = getLevelKeys(
    getUserSiderOptionsV2(getSessionUser() as User) as LevelKeysProps[]
  );

  const toggleCollapse = () => setCollapsed(!isCollapsed);

  const handleLogout = () => {
    message.success("Has cerrado sesión exitosamente.");
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
        isSidebarCollapsed={isCollapsed}
        onLogout={handleLogout}
      />

      <Sidebar
        collapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        onSideBarV2Click={handleSidebarClick}
      />

      <Layout style={{ marginLeft: isCollapsed ? collapsedWidth : sidebarWidth, width: `calc(100vw - ${isCollapsed ? collapsedWidth : sidebarWidth}px)` }}>
        <Header style={{ background: colorBgContainer }} className="d-flex justify-between">
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
          <div className="layout-content h-full">
            <Outlet />
          </div>
        </Content>
        <div className="hidden">
          <NotificationHandler />
        </div>
      </Layout>
    </Layout>
  );
};

export default BaseLayoutV2;
