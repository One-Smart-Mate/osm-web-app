import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useRouteValidation from "../utils/hooks/useRouteValidation";
import { useAppDispatch } from "../core/store";
import { useSessionStorage } from "../core/useSessionStorage";
import User from "../data/user/user";
import { setCredentials } from "../core/authReducer";
import Constants from "../utils/Constants";

const ProtectedRoutes: React.FC = () => {
  const [getSessionUser] = useSessionStorage<User>(Constants.SESSION_KEYS.user);
  const canAccess = useRouteValidation();
  const location = useLocation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if session is locked
    const isLocked = localStorage.getItem('session_locked');

    if (isLocked === 'true') {
      // Don't load user data if locked, let the redirect happen
      return;
    }

    if (getSessionUser() !== undefined) {
      const storedUser = getSessionUser() as User;
      dispatch(setCredentials({ ...storedUser }));
    }
  }, []);

  // Check if session is locked on every render
  const isSessionLocked = localStorage.getItem('session_locked') === 'true';

  // Special case: don't redirect if we're on the tags-fast-password route
  const isTagsFastPassword = location.pathname.includes('tags-fast-password');

  if (isSessionLocked && !isTagsFastPassword) {
    // Redirect to locked session page if session is locked (except for tags-fast-password)
    return <Navigate to="/locked-session" replace state={{ from: location }} />;
  }

  console.warn(`[ACCESS] ${canAccess} [ROUTE] -> ${location.pathname}`);
  return canAccess ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};

export default ProtectedRoutes;