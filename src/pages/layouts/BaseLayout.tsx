import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, theme, Avatar, MenuProps } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import {
  buttonSiderStyle,
  contentStyle,
  headerStyle,
} from "./BaseLayoutStyles";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getUserSiderOptions } from "../routes/Routes";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import { useAppSelector } from "../../core/store";
import { selectCurrentUser } from "../../core/authReducer";
import {
  getUserRol,
  RESPONSIVE_AVATAR,
  UserRoles,
} from "../../utils/Extensions";
import Logout from "../auth/Logout";
import Routes, { UnauthorizedRoute } from "../../utils/Routes";

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

const BaseLayout: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);

  //provisional code
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPath, setSelectedPath] = useState("");
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);

  const validateRoute = () => {
    const route = location.pathname.split("/");

    const isAdminRoute = route[1] === Routes.AdminPrefix.substring(1);

    const isReceptionistRoute = route[1] === Routes.SysadminPrefix.substring(1);

    const user = getSessionUser() as User;
    const rol = getUserRol(user);
    if (
      isAdminRoute &&
      (rol == UserRoles.LOCALSYSADMIN || rol == UserRoles.LOCALADMIN)
    ) {
      navigate(UnauthorizedRoute, { replace: true });
    }
    if (isReceptionistRoute && rol == UserRoles.LOCALADMIN) {
      navigate(UnauthorizedRoute, { replace: true });
    }
  };

  useEffect(() => {
    setSelectedPath(location.pathname + location.search);
    validateRoute();
  }, [location]);

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
  //----------

  const [isCollapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const levelKeys = getLevelKeys(
    getUserSiderOptions(getSessionUser() as User) as LevelKeysProps[]
  );

  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);

  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };

  return (
    <Layout className="flex w-full h-screen relative">
      <Sider
        className={`${isCollapsed ? "hidden" : ""} sm:block`}
        trigger={null}
        collapsible
        collapsed={isCollapsed}
      >
        <div className="m-2 flex justify-center bg-white">
          <Avatar
            size={RESPONSIVE_AVATAR}
            src={<img src={user?.logo} alt={Strings.logo} />}
            shape="square"
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          onClick={handleOnClick}
          selectedKeys={[selectedPath]}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
          items={getUserSiderOptions(getSessionUser() as User)}
        />
        <div className="bottom-10 left-3 absolute">
          <Logout />
        </div>
      </Sider>
      <Layout>
        <Header style={headerStyle(colorBgContainer)}>
          <Button
            type="text"
            icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!isCollapsed)}
            style={buttonSiderStyle}
          />
        </Header>
        <Content
          className="p-3 mt-6 ml-4 mr-4"
          style={contentStyle(colorBgContainer, borderRadiusLG)}
        >
          <span className="absolute bottom-0 right-8 text-xs md:text-sm">
            {Strings.tagVersion}
          </span>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BaseLayout;
