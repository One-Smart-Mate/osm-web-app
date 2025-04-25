import { useNavigate } from "react-router-dom";
import { MenuProps } from "antd";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import { ItemType } from "antd/es/menu/interface";
import { getUserRol, UserRoles } from "../../utils/Extensions";
import { localAdminCardDetailV2, localAdminRoutesSiderOptionsV2 } from "./RoutesV2";


export function navigateWithState() {
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);

    const navigate = useNavigate();
    const user = getSessionUser();

    const defaultSite =  user?.sites[0];

    return (path: string) => {
      navigate(path, {
        state: {
          siteId: defaultSite?.id,
          siteName: defaultSite?.name,
          siteLogo: defaultSite?.logo,
        }
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

  switch (rol) {
    case UserRoles.LOCALADMIN:
      routes = localAdminRoutesSiderOptionsV2();
      break;
    default:
      break;
  }

  return routes;
};


export const buildCardDetailRoute = (siteId: string, cardId: string): string => {
  return `detail/${siteId}/${cardId}`;
}