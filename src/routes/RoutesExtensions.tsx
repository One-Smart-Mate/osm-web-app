import { useNavigate } from "react-router-dom";
import { MenuProps } from "antd";

import { ItemType } from "antd/es/menu/interface";
import { useSessionStorage } from "../core/useSessionStorage";
import User from "../data/user/user";
import Constants from "../utils/Constants";
import { getUserRol, UserRoles } from "../utils/Extensions";
import { localAdminRoutesSiderOptions, localIHSisAdminRoutesSiderOptions, localSisAdminRoutesSiderOptions, tagDetailsRoute } from "./Routes";


export function navigateWithState() {
  
  const [getSessionUser] = useSessionStorage<User>(Constants.SESSION_KEYS.user);
  const navigate = useNavigate();
  const user = getSessionUser();
  const defaultSite = user?.sites[0];

  return (path: string, props?: any, loggedUser?: User) => {
    
    navigate(path, {
      state: {
        siteId: defaultSite?.id ?? loggedUser?.sites[0].id,
        siteName: defaultSite?.name ?? loggedUser?.sites[0].name,
        siteLogo: defaultSite?.logo ?? loggedUser?.sites[0].logo,
        companyId: user?.companyId ?? loggedUser?.companyId,
        companyName: user?.companyName ?? loggedUser?.companyName,
        userId: user?.userId ?? loggedUser?.userId,
        ...props,
      },
    });
  };
}

export function getItemV2({
  label,
  key,
  icon,
  section,
  children,
  type,
}: {
  label: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  section?: string;
  children?: MenuItem[];
  type?: "group";
}): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
    section,
  } as MenuItem;
}

export type MenuItem = Required<MenuProps>["items"][number];

export const getUserSiderOptions = (user: User): ItemType[] => {
  const rol = getUserRol(user);

  let routes: ItemType[] = [];
  switch (rol) {
    case UserRoles.LOCALADMIN:
      routes = localAdminRoutesSiderOptions();
      break;
      case UserRoles.LOCALSYSADMIN:
        routes = localSisAdminRoutesSiderOptions();
      break;
      case UserRoles.IHSISADMIN:
        routes = localIHSisAdminRoutesSiderOptions();
      break;
    default:
      break;
  }

  return routes;
};

export const buildCardDetailRoute = (
  siteId: string,
  cardId: string
): string => {
  const path = tagDetailsRoute.path
    .replace(Constants.ROUTES_PARAMS.siteId, siteId)
    .replace(Constants.ROUTES_PARAMS.cardId, cardId);
  return buildRoute(path);
};

export const buildRoute = (path: string): string => {
  return `/${Constants.ROUTES_PATH.dashboard}/${path}`;
};

export const buildInitRoute = (user: User): string => {
  const rol = getUserRol(user);
  if(rol === UserRoles.IHSISADMIN) {
    return buildRoute(Constants.ROUTES_PATH.companies);
  } else {
    return buildRoute(Constants.ROUTES_PATH.charts);
  }
};



export function navigateWithProps() {
  const navigate = useNavigate();

  return ({
    path,
    companyId,
    companyName,
    companyAddress,
    companyPhone,
    companyLogo,
    siteId,
    siteName,
  }: {
    path: string;
    companyId?: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyLogo?: string;
    siteId?: string;
    siteName?: string;
  }) => {
    navigate(buildRoute(path), {
      state: {
        companyId,
        companyName,
        companyAddress,
        companyPhone,
        companyLogo,
        siteId,
        siteName,
      },
    });
  };
}