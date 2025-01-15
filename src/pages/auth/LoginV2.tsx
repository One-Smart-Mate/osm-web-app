import { Form, Button, Input, Layout, Card } from "antd";
import React, { useEffect } from "react";
import { useLoginMutation } from "../../services/authService";
import { LoginRequest } from "../../data/user/user.request";
import { useAppDispatch } from "../../core/store";
import { setCredentials } from "../../core/authReducer";
import { Link, useNavigate } from "react-router-dom";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import {
  handleErrorNotification,
  handleWarningNotification,
} from "../../utils/Notifications";
import Meta from "antd/es/card/Meta";
import {
  getInitRoute,
  getUserRol,
  UserRoles,
  validateEmail,
} from "../../utils/Extensions";
import Strings from "../../utils/localizations/Strings";
import { ResetPasswordRoute } from "../../utils/Routes";

const LoginPage = () => {
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [getSessionUser, setSessionUser] = useSessionStorage<User>(
    Strings.empty
  );
  const navigate = useNavigate();

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
    const rol = getUserRol(user);
    if (rol === UserRoles.IHSISADMIN) {
      navigate(getInitRoute(user));
    } else if (
      rol === UserRoles.LOCALSYSADMIN ||
      rol === UserRoles.LOCALADMIN
    ) {
      navigate(getInitRoute(user), {
        state: {
          companyId: user.companyId,
          companyName: user.companyName,
        },
      });
    } else {
      handleWarningNotification(Strings.restrictedAccessMessage);
    }
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
      setSessionUser(data);
      dispatch(setCredentials({ ...data }));
      handleNavigation(data);
    } catch (error) {
      handleErrorNotification(error);
    }
  };

  return (
    <Layout className="flex justify-center items-center min-h-screen">
      <Card className="p-3 relative w-full sm:w-[600px] h-auto sm:h-[400px] rounded-2xl">
        <div className="flex items-center space-x-4">
          <img
            className="w-[250px] o h-[350px]"
            src="https://img.freepik.com/fotos-premium/trabajador-industria-hd-8k-fondo-pantalla-imagen-fotografica-stock_890746-39011.jpg"
            alt="Descripción de la imagen"
          />

          {/* Content to the right of the image */}
          <div className="flex-1">
            <Meta
              title={
                <h1 className="text-center text-3xl block font-semibold mb-4">
                  {Strings.entrepriseName}
                </h1>
              }
            />
            <div className="text-left">
              <p className="leading-tight">{Strings.loginText}</p>
            </div>
            <Form
              name="normal_login"
              className="mt-6"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              validateTrigger="onSubmit"
            >
              <Form.Item name="email" rules={[{ validator: validateEmail }]}>
                <Input
                  size="large"
                  placeholder={Strings.email}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ min: 8, required: true, message: Strings.requiredPassword }]}
                style={{ marginBottom: 8 }}
              >
                <Input.Password
                  size="large"
                  type="password"
                  placeholder={Strings.password}
                  visibilityToggle={{
                    visible: isPasswordVisible,
                    onVisibleChange: setPasswordVisible,
                  }}
                />
              </Form.Item>
              <div className="text-right mb-4">
                <Link className=" font-semibold" to={ResetPasswordRoute}>
                  {Strings.forgotPassword}
                </Link>
              </div>
              <Form.Item className="text-center">
                <Button
                  loading={isLoading}
                  className="px-12 py-4 text-lg mt-4 w-full rounded-full"
                  type="primary"
                  htmlType="submit"
                >
                  {Strings.login}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </Layout>

  );
};

export default LoginPage;
