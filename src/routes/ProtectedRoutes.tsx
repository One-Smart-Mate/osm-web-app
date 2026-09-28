import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useRouteValidation from "../utils/hooks/useRouteValidation";
import { useAppDispatch } from "../core/store";
import { useSessionStorage } from "../core/useSessionStorage";
import User from "../data/user/user";
import { setCredentials } from "../core/authReducer";
import { setSessionLocked } from "../core/genericReducer";
import Constants from "../utils/Constants";
import { UnauthorizedRoute } from "../utils/Routes";

const ProtectedRoutes: React.FC = () => {
  const [getSessionUser] = useSessionStorage<User>(Constants.SESSION_KEYS.user);
  const canAccess = useRouteValidation();
  const location = useLocation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if session is locked
    const isLocked = localStorage.getItem('session_locked');

    if (isLocked === 'true') {
      // Update Redux state
      dispatch(setSessionLocked(true));
      // Don't load user data if locked
      return;
    }

    if (getSessionUser() !== undefined) {
      const storedUser = getSessionUser() as User;
      dispatch(setCredentials({ ...storedUser }));
    }
  }, []);

  // Check if session is locked on every render
  const isSessionLocked = localStorage.getItem('session_locked') === 'true';

  if (isSessionLocked) {
    // Redirect to locked session page if session is locked
    return <Navigate to="/locked-session" replace state={{ from: location }} />;
  }

  // Distinguish "not logged in" from "logged in but route not allowed for role".
  // - No session  -> send to login ("/").
  // - Has session -> send to /unauthorized instead of bouncing through login,
  //   which caused a login flash-and-return flicker on role-restricted routes
  //   (e.g. a local_admin reaching /dashboard/sites by URL, refresh, or a link).
  const hasSession = getSessionUser() !== undefined;

  console.warn(`[ACCESS] ${canAccess} [ROUTE] -> ${location.pathname}`);

  if (canAccess) {
    return <Outlet />;
  }

  return hasSession ? (
    <Navigate to={UnauthorizedRoute} replace state={{ from: location }} />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};

export default ProtectedRoutes;