import { Form, Input, Card, Button, App as AntdApp } from "antd";
import { useEffect } from "react";
import { useLoginMutation } from "../../services/authService";
import { LoginRequest } from "../../data/user/user.request";
import { useAppDispatch } from "../../core/store";
import { setCredentials } from "../../core/authReducer";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import {
  isValidUser,
  validateEmailPromise,
} from "../../utils/Extensions";
import Strings from "../../utils/localizations/Strings";
import { ResetPasswordRoute } from "../../utils/Routes";
import { BsLock, BsPersonLock } from "react-icons/bs";
import LanguageDropdown from "../layouts/LanguageDropdown";
import Constants from "../../utils/Constants";
import AnatomyNotification from "../components/AnatomyNotification";
import { buildInitRoute, navigateWithState } from "../../routes/RoutesExtensions";

const LoginPage = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [getSessionUser, setSessionUser] = useSessionStorage<User>(
    Constants.SESSION_KEYS.user
  );
  const navigatewithState = navigateWithState();
  const { notification } = AntdApp.useApp();

  const handleUserSession = () => {
    const user = getSessionUser();
    if (user !== undefined) {
      const data = user as User;
      dispatch(setCredentials({ ...data }));
      return data;
    }
    return null;
  };

  const handleNavigation = (user: User) => {
    navigatewithState(buildInitRoute(user), null, user);
  };

  useEffect(() => {
    const user = handleUserSession();
    if (user) {
      handleNavigation(user);
    }
  }, []);

  const onFinish = async (values: any) => {
    try {
      const data = await login(
        new LoginRequest(values.email, values.password)
      ).unwrap();

      if (isValidUser(data)) {
        setSessionUser(data);
        dispatch(setCredentials({ ...data }));
        handleNavigation(data);
      } else {
        notification.error({
          message: Strings.error,
          description: Strings.permissionsError,
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error en el login:", error);
      AnatomyNotification.error(notification, error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left Side - Image */}
      <div
        className="lg:flex-1 h-64 lg:h-auto bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://firebasestorage.googleapis.com/v0/b/osm-dev-c2f20.firebasestorage.app/o/Screenshot%202025-04-27%20at%2016.05.55.png?alt=media&token=9b368678-4547-47ec-89f0-8958033a305a)", // Replace with your image URL
        }}
      />

      {/* Right Side - Login Form */}
      <div className="lg:flex-1 flex justify-center items-center p-4">
        <div>
          <div className="flex justify-end mb-4">
            <LanguageDropdown />
          </div>
          <Card
            className="shadow-lg rounded-lg w-full max-w-md"
            style={{ padding: "24px" }}
            hoverable
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold">OSM</h3>
              <p className="text-gray-500 text-sm">{Strings.loginText}</p>
            </div>
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                label={Strings.email}
                name="email"
                rules={[{ validator: validateEmailPromise }]}
              >
                <Input
                  size="large"
                  prefix={<BsPersonLock />}
                  placeholder={Strings.enterEmail}
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                label={Strings.password}
                name="password"
                rules={[
                  { min: 8, required: true, message: Strings.requiredPassword },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<BsLock />}
                  placeholder={Strings.enterPassword}
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item>
                <div className="flex justify-end">
                  <a href={ResetPasswordRoute} className="text-blue-500">
                    {Strings.forgotPassword}
                  </a>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={isLoading}
                  className="rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {Strings.login}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
