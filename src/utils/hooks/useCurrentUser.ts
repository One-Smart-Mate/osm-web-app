import { useState } from "react";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import { getUserRol, UserRoles } from "../Extensions";
import Constants from "../Constants";


const useCurrentUser = () => {
  const [getSessionUser, setSessionUser] = useSessionStorage<User>(Constants.SESSION_KEYS.user);
  const [user, setUserState] = useState<User>(getSessionUser() as User);

  const setUser = (newUser: { name: string; email: string }) => {
    setUserState((prevUser) => {
      const updatedUser = {
        ...prevUser,
        name: newUser.name,
        email: newUser.email,
      };
      setSessionUser(updatedUser);
      return updatedUser;
    });
  };

  const isIhAdmin = () => {
    return getUserRol(user) === UserRoles.IHSISADMIN;
  };

  const rol = getUserRol(user) ?? UserRoles.UNDEFINED;

  return { user, setUser, isIhAdmin, rol };
};

export default useCurrentUser;