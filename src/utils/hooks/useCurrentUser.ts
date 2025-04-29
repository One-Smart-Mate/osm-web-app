import { useState } from "react";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import { getUserRol, UserRoles } from "../Extensions";
import Constants from "../Constants";


const useCurrentUser = () => {
  const [getSessionUser] = useSessionStorage<User>(Constants.SESSION_KEYS.user);
  const [user, setUser] = useState<User>(getSessionUser() as User);

const isIhAdmin = () => {
    return getUserRol(user) === UserRoles.IHSISADMIN;
  };

  const rol =  getUserRol(user) ?? UserRoles.UNDEFINED;


  return { user, setUser, isIhAdmin, rol };
};

export default useCurrentUser;