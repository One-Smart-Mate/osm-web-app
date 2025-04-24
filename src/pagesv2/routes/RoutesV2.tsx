import {  BsBarChartLine, BsCardChecklist, BsLifePreserver } from "react-icons/bs";
import { RouteV2 } from "./models/RouteV2";
import Cards from "../../pages/card/Cards";
import { getUserRol, UserRoles } from "../../utils/Extensions";
import TechnicalSupport from "../componentsV2/TechnicalSupport";
import { ItemType } from "antd/es/menu/interface";
import { MenuProps } from "antd";
import User from "../../data/user/user";
import { getItemV2 } from "./RoutesExtensions";
import Charts from "../../pages/charts/Charts";

// Routes for local admin
const localAdminCards = new RouteV2(
  "Cards",
  "cards",
  <Cards rol={UserRoles.LOCALADMIN} />,
  <BsCardChecklist />,
  "Navigation"
);

const localAdminCharts = new RouteV2(
  "Charts",
  "charts",
  <Charts rol={UserRoles.LOCALADMIN} />,
  <BsBarChartLine />,
  "Navigation"
);

const localAdminTechnicalSupport = new RouteV2(
  "Technical Support",
  "technicalSupport",
  <TechnicalSupport />,
  <BsLifePreserver />,
  "Support"
);

const localAdminRoutesV2: RouteV2[] = [
  localAdminCards,
  localAdminCharts,
  localAdminTechnicalSupport,
];

const localAdminRoutesSiderOptionsV2 = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItemV2({
      label: localAdminCharts.label,
      key: localAdminCharts.path,
      icon: localAdminCharts.icon,
      section: localAdminCharts.section}),
      getItemV2({
        label: localAdminCards.label,
        key: localAdminCards.path,
        icon: localAdminCards.icon,
        section: localAdminCards.section,
      }),
    getItemV2({
      label: localAdminTechnicalSupport.label,
      key: localAdminTechnicalSupport.path,
      icon: localAdminTechnicalSupport.icon,
      section: localAdminTechnicalSupport.section}),
  ];
  return items;
};


export {
  localAdminRoutesSiderOptionsV2,
  localAdminRoutesV2,
};
