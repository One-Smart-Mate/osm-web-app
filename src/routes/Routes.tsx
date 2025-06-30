import {
  BsBarChartLine,
  BsBuildingAdd,
  BsCalendarCheck,
  BsCardChecklist,
  BsDiagram3,
  BsNodePlus,
  BsPeople,
  BsPersonPlus,
} from "react-icons/bs";
import { Route } from "./models/Route";
import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { getItemV2 } from "./RoutesExtensions";
import { MdHealthAndSafety } from "react-icons/md";
import React from "react";
import Strings from "../utils/localizations/Strings";
import Constants from "../utils/Constants";
import { CILTReports } from "../pages/ciltReports/CILTReports";

const CardTypesPage = React.lazy(
  () => import("../pages/cardtypes/CardTypesPage")
);
const CompaniesPage = React.lazy(() => import("../pages/company/CompaniesPage"));
const TagDetailsPage = React.lazy(
  () => import("../pages/tagdetails/TagDetailsPage")
);
const UsersPage = React.lazy(() => import("../pages/user/UsersPage"));
const LevelsPage = React.lazy(() => import("../pages/level/LevelsPage"));
const LevelsReadOnly = React.lazy(() => import("../pages/levelReadOnly/LevelReadOnly"));
const SystemHealth = React.lazy(
  () => import("../pages/systemhealth/SystemHealth")
);
const SitesPage = React.lazy(() => import("../pages/site/SitesPage"));
const ChartsPage = React.lazy(() => import("../pages/charts/ChartsPage"));
const PositionsPage = React.lazy(
  () => import("../pages/positions/PositionsPage")
);
const PrioritiesPage = React.lazy(
  () => import("../pages/priority/PrioritiesPage")
);

const CiltProceduresPage = React.lazy(
  () => import("../pages/cilt/CiltProceduresPage")
);
const CiltSequencesPage = React.lazy(
  () => import("../pages/cilt/CiltSequencesPage")
);
const OplPage = React.lazy(() => import("../pages/opl/OplPage"));
const CiltTypesPage = React.lazy(
  () => import("../pages/ciltTypes/CiltTypesPage")
);
const CiltFrecuenciesPage = React.lazy(
  () => import("../pages/ciltFrecuencies/CiltFrecuenciesPage")
);
const TagsPage = React.lazy(() => import("../pages/tags/TagsPage"));

const CiltLevelAssignamentsPage = React.lazy(
  () => import("../pages/ciltLevelAssignments/CiltLevelAssignaments")
);


const ciltLevelAssignamentsRoute = new Route(
  Strings.asignamentsSB,
  Constants.ROUTES_PATH.ciltLevelAssignaments,
  <CiltLevelAssignamentsPage />,
  <BsNodePlus />,
  Strings.cilt
);

const ciltReportsRoute = new Route(
  Strings.ciltReportsSB,
  Constants.ROUTES_PATH.ciltReports,
  <CILTReports />,
  <BsNodePlus />,
  Strings.cilt
);

// Common routes
const prioritiesRoute = new Route(
  Strings.prioritiesSB,
  Constants.ROUTES_PATH.priorities,
  <PrioritiesPage />,
  <BsCalendarCheck />,
  Strings.catalogs
);

const levelsRoute = new Route(
  Strings.levelsSB,
  Constants.ROUTES_PATH.levels,
  <LevelsPage />,
  <BsDiagram3 />,
  Strings.catalogs
);

const levelsReadOnlyRoute = new Route(
  Strings.levelsConsultation,
  Constants.ROUTES_PATH.levelsReadOnly,
  <LevelsReadOnly />,
  <BsDiagram3 />,
  Strings.catalogs
);

const tagsRoute = new Route(
  Strings.cardsSB,
  Constants.ROUTES_PATH.cards,
  <TagsPage />,
  <BsCardChecklist />,
  Strings.dashboard
);

const chartsRoute = new Route(
  Strings.chartsSB,
  Constants.ROUTES_PATH.charts,
  <ChartsPage />,
  <BsBarChartLine />,
  Strings.dashboard
);

const sitesRoute = new Route(
  Strings.sitesSB,
  Constants.ROUTES_PATH.sites,
  <SitesPage />,
  <BsBuildingAdd />,
  Strings.catalogs
);

const siteUsersRoute = new Route(
  Strings.usersSB,
  Constants.ROUTES_PATH.users,
  <UsersPage />,
  <BsPersonPlus />,
  Strings.accounts
);

const positionsRoute = new Route(
  Strings.positions,
  Constants.ROUTES_PATH.positions,
  <PositionsPage />,
  <BsPeople />,
  Strings.catalogs
);

const cardTypesRoute = new Route(
  Strings.cardTypesSB,
  Constants.ROUTES_PATH.cardTypes,
  <CardTypesPage />,
  <BsNodePlus />,
  Strings.catalogs
);

const ciltProceduresRoute = new Route(
  Strings.ciltProceduresSB,
  Constants.ROUTES_PATH.ciltProcedures,
  <CiltProceduresPage />,
  <BsNodePlus />,
  Strings.cilt
);

const oplRoute = new Route(
  Strings.oplSB,
  Constants.ROUTES_PATH.opl,
  <OplPage />,
  <BsNodePlus />,
  Strings.cilt
);

const ciltTypesRoute = new Route(
  Strings.ciltTypesSB,
  Constants.ROUTES_PATH.ciltTypes,
  <CiltTypesPage />,
  <BsNodePlus />,
  Strings.cilt
);

const ciltFrecuenciesRoute = new Route(
  Strings.ciltFrecuenciesSB,
  Constants.ROUTES_PATH.ciltFrecuencies,
  <CiltFrecuenciesPage />,
  <BsNodePlus />,
  Strings.cilt
);

const companiesRoute = new Route(
  Strings.companiesSB,
  Constants.ROUTES_PATH.companies,
  <CompaniesPage />,
  <BsBuildingAdd />,
  Strings.catalogs
);

const systemHealthRoute = new Route(
  Strings.systemHealthSB,
  "system-health",
  <SystemHealth />,
  <MdHealthAndSafety />,
  Strings.technicalSupport
);

export const tagDetailsRoute = new Route(
  Strings.cardDetailsSB,
  `${Constants.ROUTES_PATH.cardDetail}/${Constants.ROUTES_PARAMS.siteId}/${Constants.ROUTES_PARAMS.cardId}`,
  <TagDetailsPage />,
  <></>,
  ""
);

export const ciltSequencesRoute = new Route(
  "Secuencias",
  `${Constants.ROUTES_PATH.ciltSequences}/${Constants.ROUTES_PARAMS.ciltId}`,
  <CiltSequencesPage />,
  <></>,
  ""
);

const routes: Route[] = [
  tagDetailsRoute,
  ciltSequencesRoute,
  siteUsersRoute,
  sitesRoute,
  ciltReportsRoute,
  tagsRoute,
  levelsRoute,
  levelsReadOnlyRoute,
  positionsRoute,
  prioritiesRoute,
  cardTypesRoute,
  companiesRoute,
  systemHealthRoute,
  ciltProceduresRoute,
  oplRoute,
  ciltTypesRoute,
  ciltFrecuenciesRoute,
  ciltLevelAssignamentsRoute,
  chartsRoute, // Moved charts route to the end to prevent it from matching first
];

const localAdminRoutesSiderOptions = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: chartsRoute.label,
      key: chartsRoute.path,
      icon: chartsRoute.icon,
      section: chartsRoute.section,
    }),
    getItemV2({
      label: tagsRoute.label,
      key: tagsRoute.path,
      icon: tagsRoute.icon,
      section: tagsRoute.section,
    }),
    getItemV2({
      label: levelsReadOnlyRoute.label,
      key: levelsReadOnlyRoute.path,
      icon: levelsReadOnlyRoute.icon,
      section: levelsReadOnlyRoute.section,
    }),
    // getItemV2({
    //   label: positionsRoute.label,
    //   key: positionsRoute.path,
    //   icon: positionsRoute.icon,
    //   section: positionsRoute.section,
    // }),
    // getItemV2({
    //   label: ciltReportsRoute.label,
    //   key: ciltReportsRoute.path,
    //   icon: ciltReportsRoute.icon,
    //   section: ciltReportsRoute.section,
    // }),
  ];
  return items;
};

const localSisAdminRoutesSiderOptions = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: chartsRoute.label,
      key: chartsRoute.path,
      icon: chartsRoute.icon,
      section: chartsRoute.section,
    }),
    getItemV2({
      label: tagsRoute.label,
      key: tagsRoute.path,
      icon: tagsRoute.icon,
      section: tagsRoute.section,
    }),
    getItemV2({
      label: levelsReadOnlyRoute.label,
      key: levelsReadOnlyRoute.path,
      icon: levelsReadOnlyRoute.icon,
      section: levelsReadOnlyRoute.section,
    }),
    getItemV2({
      label: sitesRoute.label,
      key: sitesRoute.path,
      icon: sitesRoute.icon,
      section: sitesRoute.section,
    }),
    getItemV2({
      label: levelsRoute.label,
      key: levelsRoute.path,
      icon: levelsRoute.icon,
      section: levelsRoute.section,
    }),
    getItemV2({
      label: cardTypesRoute.label,
      key: cardTypesRoute.path,
      icon: cardTypesRoute.icon,
      section: cardTypesRoute.section,
    }),
    getItemV2({
      label: prioritiesRoute.label,
      key: prioritiesRoute.path,
      icon: prioritiesRoute.icon,
      section: prioritiesRoute.section,
    }),
    getItemV2({
      label: siteUsersRoute.label,
      key: siteUsersRoute.path,
      icon: siteUsersRoute.icon,
      section: siteUsersRoute.section,
    }),
    // getItemV2({
    //   label: positionsRoute.label,
    //   key: positionsRoute.path,
    //   icon: positionsRoute.icon,
    //   section: positionsRoute.section,
    // }),
    // getItemV2({
    //   label: ciltProceduresRoute.label,
    //   key: ciltProceduresRoute.path,
    //   icon: ciltProceduresRoute.icon,
    //   section: ciltProceduresRoute.section,
    // }),
    // getItemV2({
    //   label: oplRoute.label,
    //   key: oplRoute.path,
    //   icon: oplRoute.icon,
    //   section: oplRoute.section,
    // }),
    // getItemV2({
    //   label: ciltTypesRoute.label,
    //   key: ciltTypesRoute.path,
    //   icon: ciltTypesRoute.icon,
    //   section: ciltTypesRoute.section,
    // }),
    // getItemV2({
    //   label: ciltFrecuenciesRoute.label,
    //   key: ciltFrecuenciesRoute.path,
    //   icon: ciltFrecuenciesRoute.icon,
    //   section: ciltFrecuenciesRoute.section,
    // }),
    // getItemV2({
    //   label: ciltLevelAssignamentsRoute.label,
    //   key: ciltLevelAssignamentsRoute.path,
    //   icon: ciltLevelAssignamentsRoute.icon,
    //   section: ciltLevelAssignamentsRoute.section,
    // }),
    // getItemV2({
    //   label: ciltReportsRoute.label,
    //   key: ciltReportsRoute.path,
    //   icon: ciltReportsRoute.icon,
    //   section: ciltReportsRoute.section,
    // }),
  ];
  return items;
};

const localIHSisAdminRoutesSiderOptions = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: companiesRoute.label,
      key: companiesRoute.path,
      icon: companiesRoute.icon,
      section: companiesRoute.section,
    }),

    getItemV2({
      label: systemHealthRoute.label,
      key: systemHealthRoute.path,
      icon: systemHealthRoute.icon,
      section: systemHealthRoute.section,
    }),
  ];
  return items;
};

export {
  localAdminRoutesSiderOptions,
  localSisAdminRoutesSiderOptions,
  localIHSisAdminRoutesSiderOptions,
  routes,
};
