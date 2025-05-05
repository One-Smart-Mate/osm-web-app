import {
  BsBarChartLine,
  BsBuildingAdd,
  BsCalendarCheck,
  BsCardChecklist,
  BsDiagram3,
  BsLifePreserver,
  BsNodePlus,
  BsPeople,
  BsPersonPlus,
} from "react-icons/bs";
import { RouteV2 } from "./models/RouteV2";
import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { getItemV2 } from "./RoutesExtensions";
import Strings from "../../utils/localizations/Strings";
import Constants from "../../utils/Constants";
import { MdHealthAndSafety } from "react-icons/md";
import React from "react";

const CardTypesV2 = React.lazy(
  () => import("../../pages/cardtypes/CardTypesV2")
);
const CompaniesV2 = React.lazy(() => import("../../pages/company/CompaniesV2"));
const CardDetails = React.lazy(
  () => import("../../pages/carddetails/CardDetails")
);
const SiteUsersV2 = React.lazy(() => import("../../pages/user/SiteUsersV2"));
const LevelsV2 = React.lazy(() => import("../../pages/level/LevelsV2"));
const SystemHealth = React.lazy(
  () => import("../../pages/systemhealth/SystemHealth")
);
const SitesV2 = React.lazy(() => import("../../pages/site/SitesV2"));
const ChartsV2 = React.lazy(() => import("../../pages/charts/ChartsV2"));
const PositionsPage = React.lazy(
  () => import("../../pages/positions/PositionsPage")
);
const PrioritiesV2 = React.lazy(
  () => import("../../pages/priority/PrioritiesV2")
);
const TechnicalSupport = React.lazy(
  () => import("../components/TechnicalSupport")
);
const CiltProceduresPage = React.lazy(
  () => import("../../pages/cilt/CiltProceduresPage")
);
const OplPage = React.lazy(() => import("../../pages/opl/OplPage"));
const CiltTypesPage = React.lazy(
  () => import("../../pages/ciltTypes/CiltTypesPage")
);
const CiltFrecuenciesPage = React.lazy(
  () => import("../../pages/ciltFrecuencies/CiltFrecuenciesPage")
);
const TagsV2 = React.lazy(() => import("../../pages/card/TagsV2"));

// Common routes
const prioritiesV2 = new RouteV2(
  Strings.prioritiesSB,
  Constants.ROUTES_PATH.priorities,
  <PrioritiesV2 />,
  <BsCalendarCheck />,
  Strings.catalogs
);

const levelsV2 = new RouteV2(
  Strings.levelsSB,
  Constants.ROUTES_PATH.levels,
  <LevelsV2 />,
  <BsDiagram3 />,
  Strings.catalogs
);

const tagsV2 = new RouteV2(
  Strings.cardsSB,
  Constants.ROUTES_PATH.cards,
  <TagsV2 />,
  <BsCardChecklist />,
  Strings.dashboard
);

const chartsV2 = new RouteV2(
  Strings.chartsSB,
  Constants.ROUTES_PATH.charts,
  <ChartsV2 />,
  <BsBarChartLine />,
  Strings.dashboard
);

const sitesV2 = new RouteV2(
  Strings.sitesSB,
  Constants.ROUTES_PATH.sites,
  <SitesV2 />,
  <BsBuildingAdd />,
  Strings.catalogs
);

const siteUsersV2 = new RouteV2(
  Strings.usersSB,
  Constants.ROUTES_PATH.users,
  <SiteUsersV2 />,
  <BsPersonPlus />,
  Strings.accounts
);

const technicalSupportRoute = new RouteV2(
  Strings.technicalSupport,
  Constants.ROUTES_PATH.technicalSupport,
  <TechnicalSupport />,
  <BsLifePreserver />,
 Strings.technicalSupport
);

const positionsV2 = new RouteV2(
  Strings.positions,
  Constants.ROUTES_PATH.positions,
  <PositionsPage />,
  <BsPeople />,
  Strings.catalogs
);

const cardTypesV2 = new RouteV2(
  Strings.cardTypesSB,
  Constants.ROUTES_PATH.cardTypes,
  <CardTypesV2 />,
  <BsNodePlus />,
  Strings.catalogs
);

const ciltProceduresV2 = new RouteV2(
  Strings.ciltProceduresSB,
  Constants.ROUTES_PATH.ciltProcedures,
  <CiltProceduresPage />,
  <BsNodePlus />,
  Strings.catalogs
);

const oplV2 = new RouteV2(
  Strings.oplSB,
  Constants.ROUTES_PATH.opl,
  <OplPage />,
  <BsNodePlus />,
  Strings.catalogs
);

const ciltTypesV2 = new RouteV2(
  Strings.ciltTypesSB,
  Constants.ROUTES_PATH.ciltTypes,
  <CiltTypesPage />,
  <BsNodePlus />,
  Strings.catalogs
);

const ciltFrecuenciesV2 = new RouteV2(
  Strings.ciltFrecuenciesSB,
  Constants.ROUTES_PATH.ciltFrecuencies,
  <CiltFrecuenciesPage />,
  <BsNodePlus />,
  Strings.catalogs
);

const companiesV2 = new RouteV2(
  Strings.companiesSB,
  Constants.ROUTES_PATH.companies,
  <CompaniesV2 />,
  <BsBuildingAdd />,
  Strings.catalogs
);

const systemHealthV2 = new RouteV2(
  Strings.systemHealthSB,
  "system-health",
  <SystemHealth />,
  <MdHealthAndSafety />,
  Strings.technicalSupport
);

export const cardDetailRoute = new RouteV2(
  Strings.cardDetailsSB,
  `${Constants.ROUTES_PATH.cardDetail}/${Constants.ROUTES_PARAMS.siteId}/${Constants.ROUTES_PARAMS.cardId}`,
  <CardDetails />,
  <></>,
  ""
);

const routesV2: RouteV2[] = [
  technicalSupportRoute,
  cardDetailRoute,
  siteUsersV2,
  sitesV2,
  chartsV2,
  tagsV2,
  levelsV2,
  positionsV2,
  prioritiesV2,
  cardTypesV2,
  companiesV2,
  systemHealthV2,
  ciltProceduresV2,
  oplV2,
  ciltTypesV2,
  ciltFrecuenciesV2,
];

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
    getItemV2({
      label: positionsV2.label,
      key: positionsV2.path,
      icon: positionsV2.icon,
      section: positionsV2.section,
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
      label: levelsV2.label,
      key: levelsV2.path,
      icon: levelsV2.icon,
      section: levelsV2.section,
    }),
    getItemV2({
      label: cardTypesV2.label,
      key: cardTypesV2.path,
      icon: cardTypesV2.icon,
      section: cardTypesV2.section,
    }),
    getItemV2({
      label: prioritiesV2.label,
      key: prioritiesV2.path,
      icon: prioritiesV2.icon,
      section: prioritiesV2.section,
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
    getItemV2({
      label: positionsV2.label,
      key: positionsV2.path,
      icon: positionsV2.icon,
      section: positionsV2.section,
    }),
    getItemV2({
      label: ciltProceduresV2.label,
      key: ciltProceduresV2.path,
      icon: ciltProceduresV2.icon,
      section: ciltProceduresV2.section,
    }),
    getItemV2({
      label: oplV2.label,
      key: oplV2.path,
      icon: oplV2.icon,
      section: oplV2.section,
    }),
    getItemV2({
      label: ciltTypesV2.label,
      key: ciltTypesV2.path,
      icon: ciltTypesV2.icon,
      section: ciltTypesV2.section,
    }),
    getItemV2({
      label: ciltFrecuenciesV2.label,
      key: ciltFrecuenciesV2.path,
      icon: ciltFrecuenciesV2.icon,
      section: ciltFrecuenciesV2.section,
    }),
  ];
  return items;
};

const localIHSisAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: companiesV2.label,
      key: companiesV2.path,
      icon: companiesV2.icon,
      section: companiesV2.section,
    }),

    getItemV2({
      label: systemHealthV2.label,
      key: systemHealthV2.path,
      icon: systemHealthV2.icon,
      section: systemHealthV2.section,
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

export {
  localAdminRoutesSiderOptionsV2,
  localSisAdminRoutesSiderOptionsV2,
  localIHSisAdminRoutesSiderOptionsV2,
  routesV2,
};
