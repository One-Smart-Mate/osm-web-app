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
    if (getSessionUser() !== undefined) {
      const storedUser = getSessionUser() as User;
      dispatch(setCredentials({ ...storedUser }));
    }
  }, []);


  console.warn(`[ACCESS] ${canAccess} [ROUTE] -> ${location.pathname}`);
  return canAccess ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};

export default ProtectedRoutes;
