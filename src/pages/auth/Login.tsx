import { LockOutlined, MailOutlined } from "@ant-design/icons";
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
      console.error("Login error:", error);
      handleErrorNotification(error);
    }
  };

  return (
    <Layout className="flex justify-center items-center min-h-screen">
      <Card className="p-3 relative  lg:w-96  shadow-2xl rounded-2xl">
        <Meta
          title={
            <h1 className="text-center text-3xl block font-semibold text-white">
              {Strings.welcome}
            </h1>
          }
        />
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
              addonBefore={<MailOutlined className="text-white" />}
              placeholder={Strings.email}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { min: 8, required: true, message: Strings.requiredPassword },
            ]}
          >
            <Input.Password
              size="large"
              addonBefore={<LockOutlined className="text-white" />}
              type="password"
              placeholder={Strings.password}
              visibilityToggle={{
                visible: isPasswordVisible,
                onVisibleChange: setPasswordVisible,
              }}
            />
          </Form.Item>
          <Form.Item>
            <Link className="text-white" to={ResetPasswordRoute}>
              {Strings.forgotPassword}
            </Link>
            <Button
              loading={isLoading}
              block
              size="large"
              className="w-full mt-3"
              type="primary"
              htmlType="submit"
            >
              {Strings.login}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};

export default LoginPage;
