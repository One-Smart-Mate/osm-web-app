import React, { useState, useEffect } from "react";
import { Card, Input, Button, Typography, Space, App as AntdApp, theme, Modal } from "antd";
import { KeyOutlined, EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useFastLoginMutation } from "../../services/authService";
import { useAppDispatch } from "../../core/store";
import { setCredentials } from "../../core/authReducer";
import { setSessionLocked } from "../../core/genericReducer";
import { useSessionStorage } from "../../core/useSessionStorage";
import Constants from "../../utils/Constants";
import Strings from "../../utils/localizations/Strings";
import AnatomyNotification from "../components/AnatomyNotification";
import { buildInitRoute } from "../../routes/RoutesExtensions";

const { Title, Text } = Typography;

const LockedSession: React.FC = () => {
  const [fastPassword, setFastPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserInfo, setLastUserInfo] = useState<any>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notification } = AntdApp.useApp();
  const [, setSessionUser] = useSessionStorage(Constants.SESSION_KEYS.user);
  const [fastLogin] = useFastLoginMutation();
  const { token } = theme.useToken();

  useEffect(() => {
    // Get last user info from localStorage
    const storedInfo = localStorage.getItem('last_user_info');
    if (storedInfo) {
      try {
        setLastUserInfo(JSON.parse(storedInfo));
      } catch (error) {
        console.error("Error parsing last user info:", error);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!fastPassword.trim() || fastPassword.length !== 4) {
      AnatomyNotification.error(notification, Strings.fastPasswordValidation);
      return;
    }

    const alphaRegex = /^[A-Za-z]{4}$/;
    if (!alphaRegex.test(fastPassword)) {
      AnatomyNotification.error(notification, Strings.fastPasswordAlphabeticValidation);
      return;
    }

    try {
      setIsLoading(true);

      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const fastLoginData = {
        fastPassword: fastPassword,
        platform: Constants.PLATFORM.WEB,
        timezone: detectedTimezone,
      };

      const result = await fastLogin(fastLoginData).unwrap();

      // Clear ALL previous session data first
      sessionStorage.clear();

      // Store new user data in session storage
      setSessionUser(result);

      // Update Redux auth state
      dispatch(setCredentials(result));

      // Clear session lock from localStorage
      localStorage.removeItem('session_locked');

      // Ensure session is unlocked in Redux
      dispatch(setSessionLocked(false));

      // Update last user info with new user data
      localStorage.setItem('last_user_info', JSON.stringify({
        name: result.name,
        email: result.email,
        logo: result.logo
      }));

      notification.success({
        message: Strings.fastLoginSuccess,
        description: `Bienvenido de vuelta, ${result.name}`,
      });

      // Build the initial route for the NEW user based on their role
      const initRoute = buildInitRoute(result);

      // Navigate with the new user's data
      navigate(initRoute, {
        state: {
          siteId: result.sites[0]?.id,
          siteName: result.sites[0]?.name,
          siteLogo: result.sites[0]?.logo,
          companyId: result.companyId,
          companyName: result.companyName,
          userId: result.userId,
        },
      });
    } catch (error: any) {
      let errorMessage = Strings.fastLoginError;

      if (error?.status === 400) {
        errorMessage = Strings.fastLoginError;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      AnatomyNotification.error(notification, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && fastPassword.trim().length === 4) {
      handleSubmit();
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: Strings.returnToLoginConfirmTitle,
      content: Strings.returnToLoginConfirmContent,
      okText: Strings.yesReturn,
      cancelText: Strings.cancel,
      onOk: () => {
        // Clear all session data
        localStorage.clear();
        sessionStorage.clear();

        // Navigate to login
        navigate("/");
      }
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: token.colorBgLayout,
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 450,
          boxShadow: token.boxShadow,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <LockOutlined style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 16 }} />
          <Title level={3} style={{ margin: 0 }}>
            {Strings.sessionLocked}
          </Title>
          {lastUserInfo && (
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              {lastUserInfo.name} • {lastUserInfo.email}
            </Text>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 12 }}>
            {Strings.fastLoginModalDescription}
          </Text>

          <Input.Password
            placeholder={Strings.fastLoginModalPlaceholder}
            value={fastPassword}
            onChange={(e) => {
              const value = e.target.value;
              const filteredValue = value.replace(/[^A-Za-z]/g, '');
              setFastPassword(filteredValue);
            }}
            maxLength={4}
            size="large"
            style={{
              fontSize: '20px',
              textAlign: 'center',
              letterSpacing: '8px'
            }}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onKeyDown={handleKeyPress}
            autoFocus
          />

          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            {Strings.fastPasswordAlphabeticValidation}
          </Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            type="primary"
            size="large"
            block
            loading={isLoading}
            onClick={handleSubmit}
            disabled={!fastPassword.trim() || fastPassword.length !== 4}
            icon={<KeyOutlined />}
          >
            {Strings.fastLoginButtonText}
          </Button>

          <Button
            type="text"
            block
            onClick={handleLogout}
            disabled={isLoading}
          >
            {Strings.returnToLogin}
          </Button>
        </Space>

        <div style={{ marginTop: 24, padding: 16, backgroundColor: token.colorBgTextHover, borderRadius: 8 }}>
          <Text type="warning" style={{ fontSize: 12 }}>
            ⚠️ {Strings.sessionLockedWarning}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LockedSession;