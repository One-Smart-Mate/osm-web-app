import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Form, Button, Input, Layout, Card } from "antd";
import {
  handleErrorNotification,
  handleSucccessNotification,
  NotificationSuccess,
} from "../../utils/Notifications";
import Meta from "antd/es/card/Meta";
import { validateEmail } from "../../utils/Extensions";
import Strings from "../../utils/localizations/Strings";
import { useState } from "react";
import {
  ResetPasswordClass,
  SendResetCode,
} from "../../data/user/user.request";
import {
  useResetPasswordMutation,
  useSendCodeToEmailMutation,
  useSendCodeToVerifyMutation,
} from "../../services/userService";
import { useNavigate } from "react-router-dom";
import Routes from "../../utils/Routes";

const ResetPassword = () => {
  const [sendCodeToEmail] = useSendCodeToEmailMutation();
  const [sendCodeToVerify] = useSendCodeToVerifyMutation();
  const [sendResetPassword] = useResetPasswordMutation();
  const [isLoading, setLoading] = useState(false);
  const [showEnterCodeSection, setShowEnterCodeSection] = useState(false);
  const [showChangePasswordSection, setShowChangePasswordSection] =
    useState(false);
  const [email, setEmail] = useState(Strings.empty);
  const [code, setCode] = useState(Strings.empty);
  const navigate = useNavigate();

  const onSendEmailFormFinish = async (values: any) => {
    try {
      setLoading(true);
      await sendCodeToEmail(values.email.trim()).unwrap();
      setEmail(values.email.trim());
      setShowEnterCodeSection(true);
    } catch (error) {
      console.error("Error sending code to email:", error);
      handleErrorNotification(error);
    } finally {
      setLoading(false);
    }
  };

  const onSendCodeFormFinish = async (values: any) => {
    try {
      setLoading(true);
      await sendCodeToVerify(new SendResetCode(email, values.code)).unwrap();
      setCode(values.code);
      setShowChangePasswordSection(true);
    } catch (error) {
      console.error("Error verifying code:", error);
      handleErrorNotification(error);
    } finally {
      setLoading(false);
    }
  };

  const onChangePasswordFormFinish = async (values: any) => {
    try {
      setLoading(true);
      await sendResetPassword(
        new ResetPasswordClass(email, code, values.password)
      ).unwrap();
      setShowChangePasswordSection(true);
      navigate(Routes.Login);
      handleSucccessNotification(NotificationSuccess.RESET_PASSWORD);
    } catch (error) {
      console.error("Error changing password:", error);
      handleErrorNotification(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="flex justify-center items-center min-h-screen">
      {!showEnterCodeSection && (
        <Card className="p-3 relative  lg:w-96  shadow-2xl rounded-2xl">
          <Meta
            title={
              <h1 className="text-center text-3xl block font-semibold text-white">
                {Strings.resetPassword}
              </h1>
            }
            description={
              <p className="block text-base text-white">
                {Strings.sendCodeMessage}
              </p>
            }
          />
          <Form
            className="mt-6"
            initialValues={{ remember: true }}
            onFinish={onSendEmailFormFinish}
            validateTrigger="onSubmit"
          >
            <Form.Item name="email" rules={[{ validator: validateEmail }]}>
              <Input
                size="large"
                addonBefore={<MailOutlined className="text-white" />}
                placeholder={Strings.email}
              />
            </Form.Item>
            <Form.Item>
              <Button
                loading={isLoading}
                block
                size="large"
                className="w-full mt-3"
                type="primary"
                htmlType="submit"
              >
                {Strings.sendCode}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {showEnterCodeSection && !showChangePasswordSection && (
        <Card className="p-3 relative  lg:w-96  shadow-2xl rounded-2xl">
          <Meta
            title={
              <h1 className="text-center text-3xl block font-semibold text-white">
                {Strings.enterCode}
              </h1>
            }
            description={
              <p className="block text-base text-white">
                {Strings.enterTheCode}
              </p>
            }
          />
          <Form
            className="mt-6"
            onFinish={onSendCodeFormFinish}
            validateTrigger="onSubmit"
          >
            <Form.Item
              name="code"
              rules={[{ required: true, message: Strings.requiredCode }]}
            >
              <Input.OTP size="large" formatter={(str) => str.toUpperCase()} />
            </Form.Item>
            <Form.Item>
              <Button
                loading={isLoading}
                block
                size="large"
                className="w-full mt-3"
                type="primary"
                htmlType="submit"
              >
                {Strings.sendCode}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
      {showChangePasswordSection && (
        <Card className="p-3 relative  lg:w-96  shadow-2xl rounded-2xl">
          <Meta
            title={
              <h1 className="text-center text-3xl block font-semibold text-white">
                {Strings.resetPassword}
              </h1>
            }
            description={
              <p className="block text-base text-white">
                {Strings.enterTheNewPassword}
              </p>
            }
          />
          <Form
            className="mt-6"
            onFinish={onChangePasswordFormFinish}
            validateTrigger="onSubmit"
          >
            <Form.Item name="email" className="hidden">
              <Input
                size="large"
                addonBefore={<MailOutlined className="text-white" />}
                placeholder={Strings.email}
              />
            </Form.Item>
            <Form.Item
              name="password"
              validateFirst
              rules={[
                { min: 8, message: Strings.passwordLenght },
                { required: true, message: Strings.requiredPassword },
              ]}
              className="flex-1 mr-1"
            >
              <Input.Password
                size="large"
                minLength={8}
                addonBefore={<LockOutlined className="text-white" />}
                type="password"
                placeholder={Strings.newPassword}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              className="flex-1"
              rules={[
                { required: true, message: Strings.requiredConfirmPassword },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(Strings.passwordsDoNotMatch)
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                addonBefore={<LockOutlined className="text-white" />}
                placeholder={Strings.confirmPassword}
              />
            </Form.Item>
            <Form.Item>
              <Button
                loading={isLoading}
                block
                size="large"
                className="w-full mt-3"
                type="primary"
                htmlType="submit"
              >
                {Strings.save}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </Layout>
  );
};

export default ResetPassword;
