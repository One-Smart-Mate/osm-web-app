import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { Route } from "./models/Route";
import User from "../../data/user/user";
import { UserRoles, getUserRol } from "../../utils/Extensions";
import { BsBarChartLine, BsBuildings } from "react-icons/bs";
import Routes from "../../utils/Routes";
import Sites from "../site/Sites";
import { MdOutlineManageAccounts } from "react-icons/md";
import Cards from "../card/Tags";
import CardDetails from "../carddetails/CardDetails";
import Charts from "../charts/Charts";
import { TbCards } from "react-icons/tb";
import Strings from "../../utils/localizations/Strings";



const localAdminSites = new Route(
  Strings.siteUsersSB,
  "site users",
  Routes.LocalAdminPrefix + Routes.Sites,
  <Sites rol={UserRoles.LOCALADMIN} />,
  <MdOutlineManageAccounts />,
  ""
);

const localAdminCards = new Route(
  Strings.cardsSB,
  "cards",
  Routes.LocalAdminPrefix + Routes.Site + Routes.Cards,
  <Cards rol={UserRoles.LOCALADMIN} />,
  <TbCards />,
  ""
);

export const localAdminCardDetails = new Route(
  Strings.cardDetailsSB,
  "carddetails",
  Routes.LocalAdminPrefix + Routes.Site + Routes.CardDetails,
  <CardDetails />,
  <></>,
  ""
);

const localAdminCharts = new Route(
  Strings.chartsSB,
  "charts",
  Routes.LocalAdminPrefix + Routes.Site + Routes.Charts,
  <Charts rol={UserRoles.LOCALADMIN} />,
  <BsBarChartLine />,
  ""
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
    case UserRoles.LOCALADMIN:
      routes = localAdminRoutesSiderOptions(user);
      break;
    default:
      break;
  }


  return routes;
};

export {
  getUserSiderOptions,
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
