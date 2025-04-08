import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import { useAppDispatch } from "../../core/store";
import { logOut } from "../../core/authReducer";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { useLogoutMutation } from "../../services/userService";
import Constants from "../../utils/Constants";

const Logout = () => {
  const navigate = useNavigate();
  const [getSessionUser, _, removeSessionUser] = useSessionStorage<User>(Strings.empty);
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = Modal.useModal();
  const [logout] = useLogoutMutation();

  const showLogoutConfirm = () => {
    modal.confirm({
      title: Strings.logoutModalTittle,
      content: Strings.logutModalContent,
      okText: Strings.confirm,
      cancelText: Strings.cancel,
      onOk() {
        // First get the user
        const user = getSessionUser();
        // Then remove the user from session storage
        removeSessionUser();
        
        if (user && user.userId) {
          // Call the logout endpoint with userId and osName
          logout({
            userId: parseInt(user.userId),
            osName: Constants.osName
          }).then(() => {
            dispatch(logOut(null));
            navigate("/");
          }).catch((error) => {
            console.error("Logout error:", error);
            // Even if the API call fails, we should still log out the user from the frontend
            dispatch(logOut(null));
            navigate("/");
          });
        } else {
          // If no user is found in session, just log out from the frontend
          dispatch(logOut(null));
          navigate("/");
        }
      },
    });
  };

  return (
    <>
      <span className="text-white cursor-pointer text-base" onClick={showLogoutConfirm}>{Strings.logout}</span>
      {contextHolder}
    </>
  );
};

export default Logout;
