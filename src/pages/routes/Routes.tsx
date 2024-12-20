import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { Route } from "./models/Route";
import User from "../../data/user/user";
import { UserRoles, getUserRol } from "../../utils/Extensions";
import { BsBarChartLine, BsBuildings } from "react-icons/bs";
import Routes from "../../utils/Routes";
import Company from "../company/Companies";
import Priorities from "../priority/Priorities";
import Sites from "../site/Sites";
import CardTypess from "../cardtypes/CardTypes";
import Preclassifiers from "../preclassifier/Preclassifiers";
import Users from "../user/Users";
import { MdLowPriority, MdOutlineManageAccounts } from "react-icons/md";
import Levels from "../level/Levels";
import Cards from "../card/Cards";
import CardDetails from "../carddetails/CardDetails";
import Charts from "../charts/Charts";
import SiteUsers from "../user/SiteUsers";
import { PiMapPinAreaLight } from "react-icons/pi";
import { TbCards } from "react-icons/tb";
import { BiCategory } from "react-icons/bi";
import Strings from "../../utils/localizations/Strings";

import { AiOutlineBell } from "react-icons/ai";
import Notifications from "../notifications/Notifications";

const adminNotifications = new Route(
  "Notifications",
  "notifications",
  Routes.AdminPrefix + "/notifications",
  <Notifications />,
  <AiOutlineBell />
);

const adminCompanies = new Route(
  "Companies",
  "companies",
  Routes.AdminPrefix + Routes.AdminDirectionHome,
  <Company />,
  <BsBuildings />
);
const adminPriorities = new Route(
  "Priorities",
  "priorities",
  Routes.AdminPrefix + Routes.Priorities,
  <Priorities />,
  <></>
);

const adminUsers = new Route(
  "Users",
  "users",
  Routes.AdminPrefix + Routes.Users,
  <Users />,
  <MdOutlineManageAccounts />
);

export const adminSiteUsers = new Route(
  "Users",
  "site users",
  Routes.AdminPrefix + Routes.Site + Routes.Users,
  <SiteUsers rol={UserRoles.IHSISADMIN} />,
  <MdOutlineManageAccounts />
);

export const adminSites = new Route(
  "Sites",
  "sites",
  Routes.AdminPrefix + Routes.Company + Routes.Sites,
  <Sites rol={UserRoles.IHSISADMIN} />,
  <></>
);

const adminCardTypes = new Route(
  "Card types",
  "cardtypes",
  Routes.AdminPrefix + Routes.CardTypes,
  <CardTypess rol={UserRoles.IHSISADMIN} />,
  <></>
);

export const adminPreclassifiers = new Route(
  "Preclassifiers",
  "preclassifiers",
  Routes.AdminPrefix + Routes.Site + Routes.CardType + Routes.Preclassifiers,
  <Preclassifiers />,
  <></>
);

const adminLevels = new Route(
  "Levels",
  "levels",
  Routes.AdminPrefix + Routes.Levels,
  <Levels rol={UserRoles.IHSISADMIN} />,
  <></>
);

const adminCards = new Route(
  "Cards",
  "cards",
  Routes.AdminPrefix + Routes.Cards,
  <Cards rol={UserRoles.IHSISADMIN} />,
  <></>
);

export const adminCardDetails = new Route(
  "Card details",
  "carddetails",
  Routes.AdminPrefix + Routes.Site + Routes.CardDetails,
  <CardDetails />,
  <></>
);

const adminCharts = new Route(
  "Charts",
  "charts",
  Routes.AdminPrefix + Routes.Charts,
  <Charts rol={UserRoles.IHSISADMIN} />,
  <></>
);

const adminRoutesSiderOptions = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItem(adminCompanies.label, adminCompanies.fullPath, adminCompanies.icon),
    getItem(adminUsers.label, adminUsers.fullPath, adminUsers.icon),
    getItem(
      adminNotifications.label,
      adminNotifications.fullPath,
      adminNotifications.icon
    ),
  ];
  return items;
};

const adminRoutes: Route[] = [
  adminCompanies,
  adminUsers,
  adminPriorities,
  adminSites,
  adminCardTypes,
  adminPreclassifiers,
  adminLevels,
  adminCards,
  adminCardDetails,
  adminCharts,
  adminSiteUsers,
  adminNotifications,
];

const sysAdminCharts = new Route(
  "Charts",
  "charts",
  Routes.SysadminPrefix + Routes.Site + Routes.Charts,
  <Charts rol={UserRoles.LOCALSYSADMIN} />,
  <BsBarChartLine />
);

const sysAdminSites = new Route(
  "Sites",
  "sites",
  Routes.SysadminPrefix + Routes.Sites,
  <Sites rol={UserRoles.LOCALSYSADMIN} />,
  <BsBuildings />
);

const sysAdminSiteUsers = new Route(
  "Users",
  "site users",
  Routes.SysadminPrefix + Routes.Site + Routes.Users,
  <SiteUsers rol={UserRoles.LOCALSYSADMIN} />,
  <MdOutlineManageAccounts />
);

const sysAdminPriorities = new Route(
  "Priorities",
  "priorities",
  Routes.SysadminPrefix + Routes.Site + Routes.Priorities,
  <Priorities />,
  <MdLowPriority />
);

const sysAdminLevels = new Route(
  "Levels",
  "levels",
  Routes.SysadminPrefix + Routes.Site + Routes.Levels,
  <Levels rol={UserRoles.LOCALSYSADMIN} />,
  <PiMapPinAreaLight />
);

const sysAdminCardTypes = new Route(
  "Card types",
  "cardtypes",
  Routes.SysadminPrefix + Routes.Site + Routes.CardTypes,
  <CardTypess rol={UserRoles.LOCALSYSADMIN} />,
  <BiCategory />
);

const sysAdminCards = new Route(
  "Cards",
  "cards",
  Routes.SysadminPrefix + Routes.Site + Routes.Cards,
  <Cards rol={UserRoles.LOCALSYSADMIN} />,
  <TbCards />
);

export const sysAdminCardDetails = new Route(
  "Card details",
  "carddetails",
  Routes.SysadminPrefix + Routes.Site + Routes.CardDetails,
  <CardDetails />,
  <></>
);

export const sysAdminPreclassifiers = new Route(
  "Preclassifiers",
  "preclassifiers",
  Routes.SysadminPrefix + Routes.Site + Routes.CardType + Routes.Preclassifiers,
  <Preclassifiers />,
  <></>
);

const sysAdminRoutes: Route[] = [
  sysAdminCharts,
  sysAdminSites,
  sysAdminSiteUsers,
  sysAdminPriorities,
  sysAdminLevels,
  sysAdminCardTypes,
  sysAdminCards,
  sysAdminPreclassifiers,
  sysAdminCardDetails,
];

const sysAdminRoutesSiderOptions = (user: User): ItemType[] => {
  const items: MenuProps["items"] = [
    getItem(sysAdminSites.label, Strings.sites, sysAdminSites.icon, [
      getItem(Strings.viewSites, sysAdminSites.fullPath),
      ...user.sites.map((site) =>
        getItem(site.name, `${site.id} ${site.name}`, null, [
          getItem(
            sysAdminSiteUsers.label,
            sysAdminSiteUsers.fullPath.replace(Strings.siteParam, site.id),
            sysAdminSiteUsers.icon
          ),
          getItem(
            adminNotifications.label,
            adminNotifications.fullPath,
            adminNotifications.icon
          ),
        ])
      ),
    ]),
  ];
  return items;
};

const localAdminSites = new Route(
  "Users",
  "site users",
  Routes.LocalAdminPrefix + Routes.Sites,
  <Sites rol={UserRoles.LOCALADMIN} />,
  <MdOutlineManageAccounts />
);

const localAdminCards = new Route(
  "Cards",
  "cards",
  Routes.LocalAdminPrefix + Routes.Site + Routes.Cards,
  <Cards rol={UserRoles.LOCALADMIN} />,
  <TbCards />
);

export const localAdminCardDetails = new Route(
  "Card details",
  "carddetails",
  Routes.LocalAdminPrefix + Routes.Site + Routes.CardDetails,
  <CardDetails />,
  <></>
);

const localAdminCharts = new Route(
  "Charts",
  "charts",
  Routes.LocalAdminPrefix + Routes.Site + Routes.Charts,
  <Charts rol={UserRoles.LOCALADMIN} />,
  <BsBarChartLine />
);

const localAdminRoutes: Route[] = [
  localAdminCharts,
  localAdminCards,
  localAdminCardDetails,
  localAdminSites,
];

const localAdminRoutesSiderOptions = (user: User): ItemType[] => {
  const items: MenuProps["items"] = [
    getItem(Strings.viewSites, Strings.sites, <BsBuildings />, [
      getItem(Strings.viewSites, localAdminSites.fullPath),
      ...user.sites.map((site) =>
        getItem(site.name, `${site.id} ${site.name}`, null, [
          getItem(
            localAdminCharts.label,
            localAdminCharts.fullPath.replace(Strings.siteParam, site.id),
            localAdminCharts.icon
          ),
          getItem(
            localAdminCards.label,
            localAdminCards.fullPath.replace(Strings.siteParam, site.id),
            localAdminCards.icon
          ),
        ])
      ),
    ]),
  ];
  return items;
};

const getUserSiderOptions = (user: User): ItemType[] => {
  const rol = getUserRol(user);

  let routes: ItemType[] = [];

  switch (rol) {
    case UserRoles.IHSISADMIN:
      routes = adminRoutesSiderOptions();
      break;
    case UserRoles.LOCALSYSADMIN:
      routes = sysAdminRoutesSiderOptions(user);
      break;
    case UserRoles.LOCALADMIN:
      routes = localAdminRoutesSiderOptions(user);
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
  localAdminRoutes,
  localAdminRoutesSiderOptions,
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
