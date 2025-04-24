import { Route } from '../pages/routes/models/Route'; // Asegúrate de importar el modelo Route
import { getUserRol, UserRoles } from "../../src/utils/Extensions";
import { BsWrench, BsHeadset } from "react-icons/bs";
import Strings from "../../src/utils/localizations/Strings";
import User from '../data/user/user';
import { MenuProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import Cards from '../pages/card/Tags';
import TechnicalSupport from './ComponentsV2/TechnicalSupport';

// Rutas para el rol de LOCALADMIN
const localAdminCards = new Route(
  Strings.cardsSB,
  "cards",
  "/localadmin/cards",
  <Cards rol={UserRoles.LOCALADMIN} />,
  <BsWrench />,
  "Navigation" // Agrega la sección aquí
);

const localAdminCharts = new Route(
  Strings.chartsSB,
  "charts",
  "/localadmin/charts",
  <TechnicalSupport />,
  <BsWrench />,
  "Navigation" // Agrega la sección aquí
);

const localAdminTechnicalSupport = new Route(
  Strings.technicalSupportSB,
  "technicalSupport",
  "/localadmin/technicalsupport",
  <TechnicalSupport />,
  <BsHeadset />,
  "Support" // Agrega la sección aquí
);

const localAdminRoutes: Route[] = [
  localAdminCards,
  localAdminCharts,
  localAdminTechnicalSupport,
];

const localAdminRoutesSiderOptions = (): ItemType[] => {
  const items: MenuProps["items"] = [
    getItem(localAdminCards.label, localAdminCards.fullPath, localAdminCards.icon, localAdminCards.section),
    getItem(localAdminCharts.label, localAdminCharts.fullPath, localAdminCharts.icon, localAdminCharts.section),
    getItem(localAdminTechnicalSupport.label, localAdminTechnicalSupport.fullPath, localAdminTechnicalSupport.icon, localAdminTechnicalSupport.section),
  ];
  return items;
};

const getUserSiderOptionsV2 = (user: User): ItemType[] => {
  const rol = getUserRol(user);

  let routes: ItemType[] = [];

  switch (rol) {
    case UserRoles.LOCALADMIN:
      routes = localAdminRoutesSiderOptions();
      break;
    default:
      break;
  }

  return routes;
};

export {
  localAdminRoutesSiderOptions,
  localAdminRoutes,
  getUserSiderOptionsV2,
};

// Exportación por defecto
const routesV2 = [
  ...localAdminRoutes,
];

export default routesV2;

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  section?: string, // Agrega la sección aquí
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
    section, // Agrega la sección aquí
  } as MenuItem;
}

type MenuItem = Required<MenuProps>["items"][number];
