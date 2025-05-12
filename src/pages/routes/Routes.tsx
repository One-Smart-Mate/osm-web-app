import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { Route } from "./models/Route";
import User from "../../data/user/user";
import { UserRoles, getUserRol } from "../../utils/Extensions";
import { BsBuildings } from "react-icons/bs";
import Routes from "../../utils/Routes";
import Company from "../company/Companies";
import Priorities from "../priority/Priorities";
import Sites from "../site/Sites";
import CardTypess from "../cardtypes/CardTypes";
import Preclassifiers from "../preclassifier/Preclassifiers";
import Users from "../user/Users";
import { MdLowPriority, MdOutlineManageAccounts } from "react-icons/md";
import Levels from "../level/Levels";
import Cards from "../card/Tags";
import CardDetails from "../carddetails/CardDetails";
import SiteUsers from "../user/SiteUsers";
import { PiMapPinAreaLight } from "react-icons/pi";
import { TbCards } from "react-icons/tb";
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

const adminCompanies = new Route(
  Strings.companiesSB,
  "companies",
  Routes.AdminPrefix + Routes.AdminDirectionHome,
  <Company />,
  <BsBuildings />
);
const adminPriorities = new Route(
  Strings.prioritiesSB,
  "priorities",
  Routes.AdminPrefix + Routes.Priorities,
  <Priorities />,
  <></>
);

const adminUsers = new Route(
  Strings.usersSB,
  "users",
  Routes.AdminPrefix + Routes.Users,
  <Users />,
  <MdOutlineManageAccounts />,
);

export const adminSiteUsers = new Route(
  Strings.siteUsersSB,
  "site users",
  Routes.AdminPrefix + Routes.Site + Routes.Users,
  <SiteUsers rol={UserRoles.IHSISADMIN} />,
  <MdOutlineManageAccounts />
);

export const adminSites = new Route(
  Strings.sitesSB,
  "sites",
  Routes.AdminPrefix + Routes.Company + Routes.Sites,
  <Sites rol={UserRoles.IHSISADMIN} />,
  <></>
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

const adminCards = new Route(
  Strings.cardsSB,
  "cards",
  Routes.AdminPrefix + Routes.Cards,
  <Cards rol={UserRoles.IHSISADMIN} />,
  <></>,
);

export const adminCardDetails = new Route(
  Strings.cardDetailsSB,
  "carddetails",
  Routes.AdminPrefix + Routes.Site + Routes.CardDetails,
  <CardDetails />,
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
    getItem(adminCompanies.label, adminCompanies.fullPath, adminCompanies.icon),
    getItem(adminUsers.label, adminUsers.fullPath, adminUsers.icon),
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
  adminCompanies,
  adminUsers,
  adminPriorities,
  adminSites,
  adminCardTypes,
  adminPreclassifiers,
  adminLevels,
  adminCards,
  adminCardDetails,
  adminSiteUsers,
  adminPositions,
  adminNotifications,
  adminSystemHealth,
];


const sysAdminSites = new Route(
  Strings.sitesSB,
  "sites",
  Routes.SysadminPrefix + Routes.Sites,
  <Sites rol={UserRoles.LOCALSYSADMIN} />,
  <BsBuildings />,
);

const sysAdminSiteUsers = new Route(
  Strings.siteUsersSB,
  "users",
  Routes.SysadminPrefix + Routes.Site + Routes.Users,
  <SiteUsers rol={UserRoles.LOCALSYSADMIN} />,
  <MdOutlineManageAccounts />,
);

const sysAdminPriorities = new Route(
  Strings.prioritiesSB,
  "priorities",
  Routes.SysadminPrefix + Routes.Site + Routes.Priorities,
  <Priorities />,
  <MdLowPriority />,
);

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

const sysAdminCards = new Route(
  Strings.cardsSB,
  "cards",
  Routes.SysadminPrefix + Routes.Site + Routes.Cards,
  <Cards rol={UserRoles.LOCALSYSADMIN} />,
  <TbCards />,
);

export const sysAdminCardDetails = new Route(
  Strings.cardDetailsSB,
  "carddetails",
  Routes.SysadminPrefix + Routes.Site + Routes.CardDetails,
  <CardDetails />,
  <></>
);

export const sysAdminPreclassifiers = new Route(
  Strings.preclassifiersSB,
  "preclassifiers",
  Routes.SysadminPrefix + Routes.Site + Routes.CardType + Routes.Preclassifiers,
  <Preclassifiers />,
  <></>
);

const sysAdminRoutes: Route[] = [
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
            sysAdminCards.label,
            sysAdminCards.fullPath.replace(Strings.siteParam, site.id),
            sysAdminCards.icon
          ),
          getItem(
            sysAdminLevels.label,
            sysAdminLevels.fullPath.replace(Strings.siteParam, site.id),
            sysAdminLevels.icon
          ),
          getItem(
            sysAdminCardTypes.label,
            sysAdminCardTypes.fullPath.replace(Strings.siteParam, site.id),
            sysAdminCardTypes.icon
          ),
          getItem(
            sysAdminPriorities.label,
            sysAdminPriorities.fullPath.replace(Strings.siteParam, site.id),
            sysAdminPriorities.icon
          ),
        ])
      ),
    ]),
  ];
  return items;
};


const localAdminSites = new Route(
  Strings.siteUsersSB,
  "site users",
  Routes.LocalAdminPrefix + Routes.Sites,
  <Sites rol={UserRoles.LOCALADMIN} />,
  <MdOutlineManageAccounts />
);


export const localAdminCardDetails = new Route(
  Strings.cardDetailsSB,
  "carddetails",
  Routes.LocalAdminPrefix + Routes.Site + Routes.CardDetails,
  <CardDetails />,
  <></>
);

const localAdminCards = new Route(
  Strings.cardsSB,
  "cards",
  Routes.LocalAdminPrefix + Routes.Site + Routes.Cards,
  <Cards rol={UserRoles.LOCALADMIN} />,
  <TbCards />
);


const localAdminRoutes: Route[] = [
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
            localAdminCards.label,
            localAdminCards.fullPath.replace(Strings.siteParam, site.id),
            localAdminCards.icon
          ),
        ]),
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
      routes = adminRoutesSiderOptions(user);
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
