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
import { UserRoles } from "../../utils/Extensions";
import TechnicalSupport from "../components/TechnicalSupport";
import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { getItemV2 } from "./RoutesExtensions";
import Strings from "../../utils/localizations/Strings";
import CardDetails from "../../pages/carddetails/CardDetails";
import Constants from "../../utils/Constants";
import CardTypesTree from "../../pages/cardtypes/CardTypes";
import SiteUsersV2 from "../../pages/user/SiteUsersV2";
import Priorities from "../../pages/priority/Priorities";
import LevelsV2 from "../../pages/level/LevelsV2";
import CompaniesV2 from "../../pages/company/CompaniesV2";
import i18next from "i18next";
import SystemHealth from "../../pages/systemhealth/SystemHealth";
import { MdHealthAndSafety } from "react-icons/md";
import SitesV2 from "../../pages/site/SitesV2";
import ChartsV2 from "../../pages/charts/ChartsV2";
import TagsV2 from "../../pages/card/TagsV2";

const buildDashboardSectionName = (): string => {
  const currentLang = i18next.language.split("-")[0].toUpperCase();
  return currentLang === Constants.es ? "Panel" : "Dashboard";
};

const buildAccountSectionName = (): string => {
  const currentLang = i18next.language.split("-")[0].toUpperCase();
  return currentLang === Constants.es ? "Cuentas" : "Accounts";
};

const buildCatalogsSectionName = (): string => {
  const currentLang = i18next.language.split("-")[0].toUpperCase();
  return currentLang === Constants.es ? "Catálogos" : "Catalogs";
};

const buildSupportSectionName = (): string => {
  const currentLang = i18next.language.split("-")[0].toUpperCase();
  return currentLang === Constants.es ? "Soporte Técnico" : "Technical Support";
};

// Routes for local admin

// Routes for sis admin
const sisAdminPrioritiesV2 = new RouteV2(
  Strings.prioritiesSB,
  Constants.ROUTES_PATH.priorities,
  <Priorities />,
  <BsCalendarCheck />,
  buildCatalogsSectionName()
);

const sisAdminCardTypesV2 = new RouteV2(
  Strings.cardTypesSB,
  Constants.ROUTES_PATH.cardTypes,
  <CardTypesTree rol={UserRoles.LOCALSYSADMIN} />,
  <BsNodePlus />,
  buildCatalogsSectionName()
);
const sisAdminLevelsV2 = new RouteV2(
  Strings.levelsSB,
  Constants.ROUTES_PATH.levels,
  <LevelsV2 role={UserRoles.LOCALSYSADMIN} />,
  <BsDiagram3 />,
  buildCatalogsSectionName()
);

//Routes for IHSISADMIN
const ihSisAdminCompaniesV2 = new RouteV2(
  Strings.companiesSB,
  Constants.ROUTES_PATH.companies,
  <CompaniesV2 />,
  <BsBuildingAdd />,
  buildCatalogsSectionName()
);


const ihSisAdminSystemHealthV2 = new RouteV2(
  Strings.systemHealthSB,
  "system-health",
  <SystemHealth />,
  <MdHealthAndSafety />,
  buildSupportSectionName()
);

// Common routes

const tagsV2 = new RouteV2(
  Strings.cardsSB,
  Constants.ROUTES_PATH.cards,
  <TagsV2 />,
  <BsCardChecklist />,
  buildDashboardSectionName()
);

const chartsV2 = new RouteV2(
  Strings.chartsSB,
  Constants.ROUTES_PATH.charts,
  <ChartsV2 />,
  <BsBarChartLine />,
  buildDashboardSectionName()
);

const sitesV2 = new RouteV2(
  Strings.sitesSB,
  Constants.ROUTES_PATH.sites,
  <SitesV2 />,
  <BsBuildingAdd />,
  buildDashboardSectionName()
);

const siteUsersV2 = new RouteV2(
  Strings.usersSB,
  Constants.ROUTES_PATH.users,
  <SiteUsersV2 />,
  <BsPersonPlus />,
  buildAccountSectionName()
);

const technicalSupportRoute = new RouteV2(
  "Technical Support",
  "technicalSupport",
  <TechnicalSupport />,
  <BsLifePreserver />,
  buildSupportSectionName()
);

export const cardDetailRoute = new RouteV2(
  Strings.cardDetailsSB,
  `${Constants.ROUTES_PATH.cardDetail}/${Constants.ROUTES_PARAMS.siteId}/${Constants.ROUTES_PARAMS.cardId}`,
  <CardDetails />,
  <></>,
  ""
);

const localAdminRoutesV2: RouteV2[] = [];

const sisAdminRoutesV2: RouteV2[] = [
  sisAdminCardTypesV2,
  sisAdminPrioritiesV2,
  sisAdminLevelsV2,
];

const ihSisAdminRoutesV2: RouteV2[] = [
  ihSisAdminCompaniesV2,
  ihSisAdminSystemHealthV2,
];

const commonRoutes: RouteV2[] = [technicalSupportRoute, cardDetailRoute, siteUsersV2, sitesV2, chartsV2, tagsV2];

const localAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: chartsV2.label,
      key: chartsV2.path,
      icon: chartsV2.icon,
      section: chartsV2.section,
    }),
    getItemV2({
      label: tagsV2.label,
      key: tagsV2.path,
      icon: tagsV2.icon,
      section: tagsV2.section,
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
      label: chartsV2.label,
      key: chartsV2.path,
      icon: chartsV2.icon,
      section: chartsV2.section,
    }),
    getItemV2({
      label: tagsV2.label,
      key: tagsV2.path,
      icon: tagsV2.icon,
      section: tagsV2.section,
    }),
    getItemV2({
      label: sitesV2.label,
      key: sitesV2.path,
      icon: sitesV2.icon,
      section: sitesV2.section,
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
      label: siteUsersV2.label,
      key: siteUsersV2.path,
      icon: siteUsersV2.icon,
      section: siteUsersV2.section,
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

    getItemV2({
      label: ihSisAdminSystemHealthV2.label,
      key: ihSisAdminSystemHealthV2.path,
      icon: ihSisAdminSystemHealthV2.icon,
      section: ihSisAdminSystemHealthV2.section,
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
  ihSisAdminRoutesV2,
};
