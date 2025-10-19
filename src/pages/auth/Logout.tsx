import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import { useAppDispatch } from "../../core/store";
import { logOut } from "../../core/authReducer";
import { useNavigate } from "react-router-dom";
import { Button, Modal, theme, Typography } from "antd";
import { useLogoutMutation } from "../../services/userService";
import Constants from "../../utils/Constants";
import { LogoutOutlined } from "@ant-design/icons";
import { BsDoorOpen } from "react-icons/bs";

interface LogoutProps {
  enableText?: boolean;
}

const Logout = ({ enableText }: LogoutProps) => {
  const navigate = useNavigate();
  const [getSessionUser, _, removeSessionUser] = useSessionStorage<User>(
    Constants.SESSION_KEYS.user
  );
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = Modal.useModal();
  const [logout] = useLogoutMutation();
  const { token } = theme.useToken();

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

        // Clear session lock flags
        localStorage.removeItem('session_locked');
        localStorage.removeItem('last_user_info');

        if (user && user.userId) {
          // Call the logout endpoint with userId and osName
          logout({
            userId: parseInt(user.userId),
            osName: Constants.osName,
          })
            .then(() => {
              dispatch(logOut(null));
              navigate("/");
            })
            .catch((error) => {
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
      {enableText ? (
        <div
          className="flex flex-wrap flex-row items-center p-2"
          onClick={showLogoutConfirm}
        >
          <BsDoorOpen
            className="mr-2"
            color={token.colorPrimary}
            size={18}
          />
          <Typography.Text style={{ color: token.colorPrimary }}>
            {Strings.logout}
          </Typography.Text>
        </div>
      ) : (
        <Button
          icon={<LogoutOutlined style={dropdownStyles.logoutIcon} />}
          style={dropdownStyles.logoutButton}
          aria-label={Strings.logout}
          onClick={showLogoutConfirm}
        />
      )}

      {contextHolder}
    </>
  );
};

const dropdownStyles = {
  logoutIcon: {
    fontSize: "24px",
    color: "#1890ff",
  },
  logoutButton: {
    border: "none",
    background: "none",
    color: "#000",
    marginLeft: "auto",
  },
};

export default Logout;
