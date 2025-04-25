import {  BsBarChartLine, BsCardChecklist, BsFillPersonPlusFill, BsLifePreserver, BsNodePlus } from "react-icons/bs";
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
import CardTypess from "../../pages/cardtypes/CardTypes";
import SiteUsers from "../../pages/user/SiteUsers";

// Routes for local admin
const localAdminCardsV2 = new RouteV2(
  Strings.cardsSB,
  "cards",
  <Cards rol={UserRoles.LOCALADMIN} />,
  <BsCardChecklist />,
  "Navigation"
);

const localAdminChartsV2 = new RouteV2(
  Strings.chartsSB,
  "charts",
  <Charts rol={UserRoles.LOCALADMIN} />,
  <BsBarChartLine />,
  "Navigation"
);

// Routes for sis admin
const localSisAdminCardsV2 = new RouteV2(
  Strings.cardsSB,
  "cards",
  <Cards rol={UserRoles.LOCALSYSADMIN} />,
  <BsCardChecklist />,
  "Navigation"
);

const localSisAdminChartsV2 = new RouteV2(
  Strings.chartsSB,
  "charts",
  <Charts rol={UserRoles.LOCALSYSADMIN} />,
  <BsBarChartLine />,
  "Navigation"
);

const localSisAdminUsersV2 = new RouteV2(
  Strings.usersSB,
  "users",
  <SiteUsers rol={UserRoles.LOCALSYSADMIN} />,
  <BsFillPersonPlusFill />,
  "Catalogs"
);

const localSisAdminCardTypesV2 = new RouteV2(
  Strings.cardTypesSB,
  "cardtypes",
  <CardTypess rol={UserRoles.LOCALSYSADMIN} />,
  <BsNodePlus />,
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

const localAdminRoutesV2: RouteV2[] = [
  localAdminCardsV2,
  localAdminChartsV2,
];

const localSisAdminRoutesV2: RouteV2[] = [
  localSisAdminCardsV2,
  localSisAdminChartsV2,
  localSisAdminUsersV2,
  localSisAdminCardTypesV2
];

const commonRoutes: RouteV2[] = [
  technicalSupportRoute,
  cardDetailRoute
];

const localAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: localAdminChartsV2.label,
      key: localAdminChartsV2.path,
      icon: localAdminChartsV2.icon,
      section: localAdminChartsV2.section}),
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
      section: technicalSupportRoute.section}),
  ];
  return items;
};

const localSisAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: localSisAdminChartsV2.label,
      key: localSisAdminChartsV2.path,
      icon: localSisAdminChartsV2.icon,
      section: localSisAdminChartsV2.section}),
      getItemV2({
        label: localSisAdminCardsV2.label,
        key: localSisAdminCardsV2.path,
        icon: localSisAdminCardsV2.icon,
        section: localSisAdminCardsV2.section,
      }),
      getItemV2({
        label: localSisAdminCardTypesV2.label,
        key: localSisAdminCardTypesV2.path,
        icon: localSisAdminCardTypesV2.icon,
        section: localSisAdminCardTypesV2.section}),
        getItemV2({
          label: localSisAdminUsersV2.label,
          key: localSisAdminUsersV2.path,
          icon: localSisAdminUsersV2.icon,
          section: localSisAdminUsersV2.section}),
    getItemV2({
      label: technicalSupportRoute.label,
      key: technicalSupportRoute.path,
      icon: technicalSupportRoute.icon,
      section: technicalSupportRoute.section}),
      
  ];
  return items;
};


export {
  localAdminRoutesSiderOptionsV2,
  localAdminRoutesV2,
  localSisAdminRoutesSiderOptionsV2,
  localSisAdminRoutesV2,
  commonRoutes
};
