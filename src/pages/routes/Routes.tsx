import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { Route } from "./models/Route";
import User from "../../data/user/user";
import { UserRoles, getUserRol } from "../../utils/Extensions";
import Routes from "../../utils/Routes";
import CardTypess from "../cardtypes/CardTypes";
import Preclassifiers from "../preclassifier/Preclassifiers";
import Levels from "../level/Levels";
import { PiMapPinAreaLight } from "react-icons/pi";
import { BiCategory } from "react-icons/bi";
import Strings from "../../utils/localizations/Strings";
import PositionsPage from "../positions/PositionsPage";
import { AiOutlineBell } from "react-icons/ai";
import Notifications from "../notifications/Notifications";
import { MdHealthAndSafety } from "react-icons/md";
import SystemHealth from "../systemhealth/SystemHealth";

const adminNotifications = new Route(
  Strings.notificationsSB,
  "notifications",
  Routes.AdminPrefix + "/notifications",
  <Notifications />,
  <AiOutlineBell />
);



const adminCardTypes = new Route(
  Strings.cardTypesSB,
  "cardtypes",
  Routes.AdminPrefix + Routes.CardTypes,
  <CardTypess rol={UserRoles.IHSISADMIN} />,
  <></>
);

export const adminPreclassifiers = new Route(
  Strings.preclassifiersSB,
  "preclassifiers",
  Routes.AdminPrefix + Routes.Site + Routes.CardType + Routes.Preclassifiers,
  <Preclassifiers />,
  <></>,
);

const adminLevels = new Route(
  Strings.preclassifiersSB,
  "levels",
  Routes.AdminPrefix + Routes.Levels,
  <Levels role={UserRoles.IHSISADMIN} />,
  <></>,
);



const adminPositions = new Route(
  Strings.positionsSB,
  "positions",
  Routes.AdminPrefix + Routes.Positions,
  <PositionsPage />,
  <></>,
);

const adminSystemHealth = new Route(
  Strings.systemHealthSB,
  "system-health",
  Routes.AdminPrefix + Routes.SystemHealth,
  <SystemHealth />,
  <MdHealthAndSafety />
);

const adminRoutesSiderOptions = (user: User): ItemType[] => {
  const items: MenuProps["items"] = [
    getItem(
      adminNotifications.label,
      adminNotifications.fullPath,
      adminNotifications.icon
    ),
  ];
  
  // Add System Health button only for IHSISADMIN role
  if (getUserRol(user) === UserRoles.IHSISADMIN) {
    items.push(
      getItem(
        adminSystemHealth.label,
        adminSystemHealth.fullPath,
        adminSystemHealth.icon
      )
    );
  }
  
  return items;
};

const adminRoutes: Route[] = [
  adminCardTypes,
  adminPreclassifiers,
  adminLevels,
  adminPositions,
  adminNotifications,
  adminSystemHealth,
];


const sysAdminLevels = new Route(
  Strings.levelsSB,
  "levels",
  Routes.SysadminPrefix + Routes.Site + Routes.Levels,
  <Levels role={UserRoles.LOCALSYSADMIN} />,
  <PiMapPinAreaLight />,
);

const sysAdminCardTypes = new Route(
  Strings.cardTypesSB,
  "cardtypes",
  Routes.SysadminPrefix + Routes.Site + Routes.CardTypes,
  <CardTypess rol={UserRoles.LOCALSYSADMIN} />,
  <BiCategory />,
);



export const sysAdminPreclassifiers = new Route(
  Strings.preclassifiersSB,
  "preclassifiers",
  Routes.SysadminPrefix + Routes.Site + Routes.CardType + Routes.Preclassifiers,
  <Preclassifiers />,
  <></>
);

const sysAdminRoutes: Route[] = [
  sysAdminLevels,
  sysAdminCardTypes,
  sysAdminPreclassifiers,
];



const getUserSiderOptions = (user: User): ItemType[] => {
  const rol = getUserRol(user);

  let routes: ItemType[] = [];

  switch (rol) {
    case UserRoles.IHSISADMIN:
      routes = adminRoutesSiderOptions(user);
      break;
    default:
      break;
  }

  const notificationsRoute = getItem(
    adminNotifications.label,
    adminNotifications.fullPath,
    adminNotifications.icon
  );
  if (!routes.some((item) => item?.key === adminNotifications.fullPath)) {
    routes.push(notificationsRoute);
  }

  return routes;
};

export {
  adminRoutesSiderOptions,
  adminRoutes,
  getUserSiderOptions,
  sysAdminRoutes,
};

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

type MenuItem = Required<MenuProps>["items"][number];
