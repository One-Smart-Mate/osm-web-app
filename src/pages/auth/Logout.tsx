import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import Strings from "../../utils/localizations/Strings";
import { useAppDispatch } from "../../core/store";
import { logOut } from "../../core/authReducer";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";

const Logout = () => {
  const navigate = useNavigate();
  const [_, __, removeSessionUser] = useSessionStorage<User>(Strings.empty);
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = Modal.useModal();

  const showLogoutConfirm = () => {
    modal.confirm({
      title: Strings.logoutModalTittle,
      content: Strings.logutModalContent,
      okText: Strings.confirm,
      cancelText: Strings.cancel,
      onOk() {
        removeSessionUser();
        dispatch(logOut(null));
        navigate("/");
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
