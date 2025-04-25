import { useNavigate } from "react-router-dom";
import { MenuProps } from "antd";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import { ItemType } from "antd/es/menu/interface";
import { getUserRol, UserRoles } from "../../utils/Extensions";
import { cardDetailRoute, localAdminRoutesSiderOptionsV2, localSisAdminRoutesSiderOptionsV2 } from "./RoutesV2";
import Constants from "../../utils/Constants";

export function navigateWithState() {
  
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);
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

export const getUserSiderOptionsV2 = (user: User): ItemType[] => {
  const rol = getUserRol(user);

  let routes: ItemType[] = [];
  console.log(`ROLES ${rol}`)
  switch (rol) {
    case UserRoles.LOCALADMIN:
      routes = localAdminRoutesSiderOptionsV2();
      break;
      case UserRoles.LOCALSYSADMIN:
        routes = localSisAdminRoutesSiderOptionsV2();
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
  const path = cardDetailRoute.path
    .replace(Constants.ROUTES_PARAMS.siteId, siteId)
    .replace(Constants.ROUTES_PARAMS.cardId, cardId);
  return buildRoute(path);
};

export const buildRoute = (path: string): string => {
  return `/${Constants.ROUTES_PATH.dashboard}/${path}`;
};

export const buildInitRoute = (): string => {
  return buildRoute("charts");
};
