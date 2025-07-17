import { useLocation } from "react-router-dom";
import useCurrentUser from "./useCurrentUser";
import { UserRoles } from "../Extensions";
import Constants from "../Constants";


const useRouteValidation = (): boolean => {
  const location = useLocation();
  const { user, rol } = useCurrentUser();

  if (!user) {
    return false; // No user, no access
  }

  const currentRole = rol;

  const accessibleRoutes: Record<UserRoles, (string | RegExp)[]> = {
    [UserRoles.IHSISADMIN]: ["*"],
    [UserRoles.LOCALADMIN]: [
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cards}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.tagsFastPassword}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.charts}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.positions}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.technicalSupport}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltProcedures}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.opl}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.oplTypes}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltTypes}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltFrecuencies}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltLevelAssignaments}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltReports}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltCharts}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.levelsReadOnly}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.amDiscardReasons}`,
    new RegExp(`^/${Constants.ROUTES_PATH.dashboard}/card-detail/[^/]+/[^/]+$`),
    new RegExp(`^/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltSequences}/[^/]+$`)    ],
    [UserRoles.LOCALSYSADMIN]: [
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cards}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.tagsFastPassword}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.charts}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.positions}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.technicalSupport}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltProcedures}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.opl}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.oplTypes}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltTypes}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltFrecuencies}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltLevelAssignaments}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltReports}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltCharts}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.sites}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.levels}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.levelsReadOnly}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cardTypes}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.priorities}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.amDiscardReasons}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.users}`,
    new RegExp(`^/${Constants.ROUTES_PATH.dashboard}/card-detail/[^/]+/[^/]+$`),
    new RegExp(`^/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.ciltSequences}/[^/]+$`)    ],
    [UserRoles.UNDEFINED]: [
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cards}`,
    `/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.levelsReadOnly}`,
    new RegExp(`^/${Constants.ROUTES_PATH.dashboard}/card-detail/[^/]+/[^/]+$`)    ],
  };

  // Check if the current route is accessible for the user's role
  const allowedRoutes = accessibleRoutes[currentRole] || [];
  if (allowedRoutes.includes("*")) {
    return true; // Full access
  }

  const isAllowed = allowedRoutes.some((route) => {
    if (typeof route === "string") {
      return location.pathname.startsWith(route);
    }
    if (route instanceof RegExp) {
      return route.test(location.pathname);
    }
    return false;
  });
  return isAllowed;
};

export default useRouteValidation;