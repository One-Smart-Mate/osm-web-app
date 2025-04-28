import { useState } from "react";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../localizations/Strings";
import { getUserRol, UserRoles } from "../Extensions";


const useCurrentUser = () => {
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);
  const [user, setUser] = useState<User>(getSessionUser() as User);

const isIhAdmin = () => {
    return getUserRol(user) === UserRoles.IHSISADMIN;
  };

  const rol =  getUserRol(user) ?? UserRoles.UNDEFINED;


  return { user, setUser, isIhAdmin, rol };
};

export default useCurrentUser;