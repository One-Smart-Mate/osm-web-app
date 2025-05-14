import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Form, Button, Input, Card, Typography } from "antd";
import {
  handleErrorNotification,
  handleSucccessNotification,
  NotificationSuccess,
} from "../../utils/Notifications";
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
import LanguageDropdown from "../components/LanguageDropdown";
import { BsEnvelope } from "react-icons/bs";
import { theme } from "antd";
import useDarkMode from "../../utils/hooks/useDarkMode";

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
  const isDarkMode = useDarkMode();
  const { token } = theme.useToken();

  const onSendEmailFormFinish = async (values: any) => {
    try {
      setLoading(true);
      await sendCodeToEmail(values.email.trim()).unwrap();
      setEmail(values.email.trim());
      setShowEnterCodeSection(true);
    } catch (error) {
      console.error("[ResetPassword] onSendEmailFormFinish", error);
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
      console.error("[ResetPassword] onSendCodeFormFinish", error);
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
      console.error("[ResetPassword] onChangePasswordFormFinish", error);
      handleErrorNotification(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        <div
          className="lg:flex-1 flex justify-center items-center p-4"
          style={isDarkMode ? { backgroundColor: token.colorBgBase } : {}}
        >
          <div>
            <div className="flex justify-end mb-4">
              <LanguageDropdown />
            </div>
            <Card
              className="shadow-lg rounded-lg w-full max-w-md"
              style={{ padding: "24px" }}
              hoverable
              title={
                <Typography.Title level={3} className="text-center">
                  {Strings.resetPassword}
                </Typography.Title>
              }
            >
              {!showEnterCodeSection && (
                <>
                  <Typography.Paragraph className="text-center">
                    {Strings.sendCodeMessage}
                  </Typography.Paragraph>
                  <Form
                    className="mt-6"
                    initialValues={{ remember: true }}
                    onFinish={onSendEmailFormFinish}
                    validateTrigger="onSubmit"
                  >
                    <Form.Item
                      name="email"
                      rules={[{ validator: validateEmail }]}
                    >
                      <Input
                        size="large"
                        type="email"
                        addonBefore={<BsEnvelope />}
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
                </>
              )}

              {showEnterCodeSection && !showChangePasswordSection && (
                <>
                  <Typography.Paragraph className="text-center">
                    {Strings.enterTheCode}
                  </Typography.Paragraph>
                  <Form
                    className="mt-6"
                    onFinish={onSendCodeFormFinish}
                    validateTrigger="onSubmit"
                  >
                    <Form.Item
                      name="code"
                      className="flex w-full justify-center"
                      rules={[
                        { required: true, message: Strings.requiredCode },
                      ]}
                    >
                      <Input.OTP
                        size="large"
                        formatter={(str) => str.toUpperCase()}
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
                </>
              )}

              {showChangePasswordSection && (
                <>
                  <Typography.Paragraph className="text-center">
                    {Strings.enterTheNewPassword}
                  </Typography.Paragraph>
                  <Form
                    className="mt-6"
                    onFinish={onChangePasswordFormFinish}
                    validateTrigger="onSubmit"
                  >
                    <Form.Item name="email" className="hidden">
                      <Input
                        size="large"
                        addonBefore={<MailOutlined />}
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
                        addonBefore={<LockOutlined />}
                        type="password"
                        placeholder={Strings.newPassword}
                      />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      dependencies={["password"]}
                      className="flex-1"
                      rules={[
                        {
                          required: true,
                          message: Strings.requiredConfirmPassword,
                        },
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
                        addonBefore={<LockOutlined />}
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
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
