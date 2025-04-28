import { Form, Input, Layout, Card, Button } from "antd";
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
  isRedesign,
  UserRoles,
  validateEmail,
} from "../../utils/Extensions";
import Strings from "../../utils/localizations/Strings";
import { ResetPasswordRoute } from "../../utils/Routes";
import AnatomyButton from "../../components/AnatomyButton";
import {
  buildInitRoute,
  navigateWithState,
} from "../../pagesRedesign/routes/RoutesExtensions";
import { BsFileLock, BsPersonLock } from "react-icons/bs";
import LanguageDropdown from "../layouts/LanguageDropdown";

const LoginPage = () => {
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [getSessionUser, setSessionUser] = useSessionStorage<User>(
    Strings.empty
  );
  const navigate = useNavigate();
  const navigatewithState = navigateWithState();

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
    console.log(isRedesign());
    if (isRedesign()) {
      navigatewithState(buildInitRoute(user), null, user);
    } else {
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
      console.error("Error en el login:", error);
      handleErrorNotification(error);
    }
  };

  return isRedesign() ? (
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
                rules={[{ validator: validateEmail }]}
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
                  prefix={<BsFileLock />}
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
  ) : (
    <Layout className="flex justify-center items-center min-h-screen">
      <Card className="p-6 relative sm:w-[600px] sm:h-[450px] rounded-2xl flex items-center">
        <div className="flex w-full h-full items-center space-x-4">
          <img
            className="w-[250px] h-[350px] hidden sm:block object-cover rounded-xl"
            src="https://img.freepik.com/fotos-premium/trabajador-industria-hd-8k-fondo-pantalla-imagen-fotografica-stock_890746-39011.jpg"
            alt={Strings.logImgDesc}
          />

          <div className="flex-1 py-4 flex flex-col h-full justify-between">
            <Meta
              title={
                <>
                  <h1 className="text-center text-3xl block font-semibold">
                    {Strings.entrepriseName}
                  </h1>
                  <span className="leading-tight text-center block font-semibold mb-4">
                    {Strings.enSub}
                  </span>
                </>
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
                <Input size="large" placeholder={Strings.email} />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { min: 8, required: true, message: Strings.requiredPassword },
                ]}
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
                <Link className="font-semibold" to={ResetPasswordRoute}>
                  {Strings.forgotPassword}
                </Link>
              </div>

              <AnatomyButton
                title="Iniciar sesión"
                onClick={() => {}}
                type="default"
                size="large"
                className="px-12 py-4 text-lg mt-4 w-full rounded-full"
                loading={isLoading}
                htmlType="submit"
              />
            </Form>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default LoginPage;
