import {  BsBarChartLine, BsCardChecklist, BsLifePreserver } from "react-icons/bs";
import { RouteV2 } from "./models/RouteV2";
import Cards from "../../pages/card/Cards";
import { UserRoles } from "../../utils/Extensions";
import TechnicalSupport from "../componentsV2/TechnicalSupport";
import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import { getItemV2 } from "./RoutesExtensions";
import Charts from "../../pages/charts/Charts";
import Strings from "../../utils/localizations/Strings";
import CardDetails from "../../pages/carddetails/CardDetails";

// Routes for local admin
const localAdminCardsV2 = new RouteV2(
  Strings.cardsSB,
  "dashboard/cards",
  <Cards rol={UserRoles.LOCALADMIN} />,
  <BsCardChecklist />,
  "Navigation"
);

const localAdminChartsV2 = new RouteV2(
  Strings.chartsSB,
  "dashboard/charts",
  <Charts rol={UserRoles.LOCALADMIN} />,
  <BsBarChartLine />,
  "Navigation"
);

const localAdminTechnicalSupportV2 = new RouteV2(
  "Technical Support",
  "dashboard/technicalSupport",
  <TechnicalSupport />,
  <BsLifePreserver />,
  "Support"
);

export const localAdminCardDetailV2 = new RouteV2(
  Strings.cardDetailsSB,
  "dashboard/cards/detail/:siteId/:cardId",
  <CardDetails />,
  <></>,
  ""
);

const localAdminRoutesV2: RouteV2[] = [
  localAdminCardsV2,
  localAdminChartsV2,
  localAdminTechnicalSupportV2,
  localAdminCardDetailV2
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
      label: localAdminTechnicalSupportV2.label,
      key: localAdminTechnicalSupportV2.path,
      icon: localAdminTechnicalSupportV2.icon,
      section: localAdminTechnicalSupportV2.section}),
  ];
  return items;
};


export {
  localAdminRoutesSiderOptionsV2,
  localAdminRoutesV2,
};
