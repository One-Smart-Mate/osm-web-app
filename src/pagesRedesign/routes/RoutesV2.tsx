import {
  BsBarChartLine,
  BsBuildingAdd,
  BsCalendarCheck,
  BsCardChecklist,
  BsDiagram3,
  BsLifePreserver,
  BsNodePlus,
  BsPersonPlus,
} from "react-icons/bs";
import { RouteV2 } from "./models/RouteV2";
import Cards from "../../pages/card/Cards";
import { UserRoles } from "../../utils/Extensions";
import TechnicalSupport from "../components/TechnicalSupport";
import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { getItemV2 } from "./RoutesExtensions";
import Charts from "../../pages/charts/Charts";
import Strings from "../../utils/localizations/Strings";
import CardDetails from "../../pages/carddetails/CardDetails";
import Constants from "../../utils/Constants";
import CardTypesTree from "../../pages/cardtypes/CardTypes";
import SiteUsersV2 from "../../pages/user/SiteUsersV2";
import Priorities from "../../pages/priority/Priorities";
import LevelsV2 from "../../pages/level/LevelsV2";
import Companies from "../../pages/company/Companies";
import Sites from "../../pages/site/Sites";
import CompaniesV2 from "../../pages/company/CompaniesV2";

// Routes for local admin
const localAdminCardsV2 = new RouteV2(
  Strings.cardsSB,
  "cards",
  <Cards rol={UserRoles.LOCALADMIN} />,
  <BsCardChecklist />,
  'Dashboard'
);

const localAdminChartsV2 = new RouteV2(
  Strings.chartsSB,
  "charts",
  <Charts rol={UserRoles.LOCALADMIN} />,
  <BsBarChartLine />,
  'Dashboard'
);

// Routes for sis admin
const sisAdminCardsV2 = new RouteV2(
  Strings.cardsSB,
  "cards",
  <Cards rol={UserRoles.LOCALSYSADMIN} />,
  <BsCardChecklist />,
 'Dashboard'
);

const sisAdminChartsV2 = new RouteV2(
  Strings.chartsSB,
  "charts",
  <Charts rol={UserRoles.LOCALSYSADMIN} />,
  <BsBarChartLine />,
  'Dashboard'
);

const sisAdminUsersV2 = new RouteV2(
  Strings.usersSB,
  "users",
  <SiteUsersV2 rol={UserRoles.LOCALSYSADMIN} />,
  <BsPersonPlus />,
  'Accounts'
);

const sisAdminPrioritiesV2 = new RouteV2(
  Strings.prioritiesSB,
  "priorities",
  <Priorities />,
  <BsCalendarCheck />,
 'Catalogs'
);

const sisAdminCardTypesV2 = new RouteV2(
  Strings.cardTypesSB,
  "cardtypes",
  <CardTypesTree rol={UserRoles.LOCALSYSADMIN} />,
  <BsNodePlus />,
  'Catalogs'
);
const sisAdminLevelsV2 = new RouteV2(
  Strings.levelsSB,
  "levels",
  <LevelsV2 role={UserRoles.LOCALSYSADMIN} />,
  <BsDiagram3 />,
 'Catalogs'
);

//Routes for IHSISADMIN
const ihSisAdminCompaniesV2 = new RouteV2(
  "Companies",
  "companies",
  <CompaniesV2 />,
  <BsBuildingAdd />,
  "Catalogs"
);

const ihSisAdminSitesV2 = new RouteV2(
  "Sites",
  "sites",
  <Sites rol={UserRoles.IHSISADMIN} />,
  <BsBuildingAdd />,
  "Catalogs"
);

// Common routes
const technicalSupportRoute = new RouteV2(
  "Technical Support",
  "technicalSupport",
  <TechnicalSupport />,
  <BsLifePreserver />,
  "Support"
);

export const cardDetailRoute = new RouteV2(
  Strings.cardDetailsSB,
  `card-detail/${Constants.ROUTES_PARAMS.siteId}/${Constants.ROUTES_PARAMS.cardId}`,
  <CardDetails />,
  <></>,
  ""
);

const localAdminRoutesV2: RouteV2[] = [localAdminCardsV2, localAdminChartsV2];

const sisAdminRoutesV2: RouteV2[] = [
  sisAdminCardsV2,
  sisAdminChartsV2,
  sisAdminUsersV2,
  sisAdminCardTypesV2,
  sisAdminPrioritiesV2,
  sisAdminLevelsV2
];


const ihSisAdminRoutesV2: RouteV2[] = [ihSisAdminCompaniesV2, ihSisAdminSitesV2];


const commonRoutes: RouteV2[] = [technicalSupportRoute, cardDetailRoute];

const localAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: localAdminChartsV2.label,
      key: localAdminChartsV2.path,
      icon: localAdminChartsV2.icon,
      section: localAdminChartsV2.section,
    }),
    getItemV2({
      label: localAdminCardsV2.label,
      key: localAdminCardsV2.path,
      icon: localAdminCardsV2.icon,
      section: localAdminCardsV2.section,
    }),
    getItemV2({
      label: technicalSupportRoute.label,
      key: technicalSupportRoute.path,
      icon: technicalSupportRoute.icon,
      section: technicalSupportRoute.section,
    }),
  ];
  return items;
};

const localSisAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: sisAdminChartsV2.label,
      key: sisAdminChartsV2.path,
      icon: sisAdminChartsV2.icon,
      section: sisAdminChartsV2.section,
    }),
    getItemV2({
      label: sisAdminCardsV2.label,
      key: sisAdminCardsV2.path,
      icon: sisAdminCardsV2.icon,
      section: sisAdminCardsV2.section,
    }),
    getItemV2({
      label: sisAdminLevelsV2.label,
      key: sisAdminLevelsV2.path,
      icon: sisAdminLevelsV2.icon,
      section: sisAdminLevelsV2.section,
    }),
    getItemV2({
      label: sisAdminCardTypesV2.label,
      key: sisAdminCardTypesV2.path,
      icon: sisAdminCardTypesV2.icon,
      section: sisAdminCardTypesV2.section,
    }),
    getItemV2({
      label: sisAdminPrioritiesV2.label,
      key: sisAdminPrioritiesV2.path,
      icon: sisAdminPrioritiesV2.icon,
      section: sisAdminPrioritiesV2.section,
    }),
    getItemV2({
      label: sisAdminUsersV2.label,
      key: sisAdminUsersV2.path,
      icon: sisAdminUsersV2.icon,
      section: sisAdminUsersV2.section,
    }),
    getItemV2({
      label: technicalSupportRoute.label,
      key: technicalSupportRoute.path,
      icon: technicalSupportRoute.icon,
      section: technicalSupportRoute.section,
    }),
  ];
  return items;
};


const localIHSisAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: ihSisAdminCompaniesV2.label,
      key: ihSisAdminCompaniesV2.path,
      icon: ihSisAdminCompaniesV2.icon,
      section: ihSisAdminCompaniesV2.section,
    }),
    
  ];
  return items;
};

export {
  localAdminRoutesSiderOptionsV2,
  localAdminRoutesV2,
  localSisAdminRoutesSiderOptionsV2,
  sisAdminRoutesV2,
  commonRoutes,
  localIHSisAdminRoutesSiderOptionsV2,
  ihSisAdminRoutesV2
};
