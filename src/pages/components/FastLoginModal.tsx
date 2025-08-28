import { useState } from "react";
import { Modal, Input, Button, Typography, Space, App as AntdApp } from "antd";
import { KeyOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../core/store";
import { setCredentials } from "../../core/authReducer";
import { setSessionLocked, selectIsSessionLocked } from "../../core/genericReducer";
import { useFastLoginMutation } from "../../services/authService";
import { useSessionStorage } from "../../core/useSessionStorage";
import Constants from "../../utils/Constants";
import Strings from "../../utils/localizations/Strings";
import AnatomyNotification from "./AnatomyNotification";

interface FastLoginModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const FastLoginModal = ({
  isVisible,
  onCancel,
  onSuccess,
}: FastLoginModalProps) => {
  const [fastPassword, setFastPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSessionLocked = useAppSelector(selectIsSessionLocked);
  const { notification } = AntdApp.useApp();
  const [, setSessionUser] = useSessionStorage(Constants.SESSION_KEYS.user);

  const [fastLogin] = useFastLoginMutation();

  const handleSubmit = async () => {
    if (!fastPassword.trim() || fastPassword.length !== 4) {
      AnatomyNotification.error(notification, "El fast password debe tener exactamente 4 caracteres");
      return;
    }

    // Validate alphabetic format (A-Z, a-z) as per the working example
    const alphaRegex = /^[A-Za-z]{4}$/;
    if (!alphaRegex.test(fastPassword)) {
      AnatomyNotification.error(notification, Strings.fastPasswordAlphabeticValidation);
      return;
    }

    try {
      setIsLoading(true);

      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const fastLoginData = {
        fastPassword: fastPassword, // Keep original case (don't convert to uppercase)
        platform: Constants.PLATFORM.WEB,
        timezone: detectedTimezone,
      };

      console.log("🔍 Fast Login attempt - Full payload:", fastLoginData);
      console.log("🔍 Fast Password being sent:", fastPassword);
      console.log("🔍 Platform being sent:", Constants.PLATFORM.WEB);
      console.log("🔍 Timezone detected:", detectedTimezone);
      console.log("🔍 Timezone length:", detectedTimezone.length);
      console.log("🔍 FastPassword length:", fastPassword.length);

      const result = await fastLogin(fastLoginData).unwrap();

      console.log("✅ Fast Login successful:", result);

      // Store user data in session storage
      setSessionUser(result);

      // Update Redux auth state
      dispatch(setCredentials(result));

      // Unlock session
      dispatch(setSessionLocked(false));

      notification.success({
        message: Strings.fastLoginSuccess,
        description: `Bienvenido de vuelta, ${result.name}`,
      });

      // Reset form
      setFastPassword("");
      
      // Force a small delay to ensure all state updates are processed
      // This is crucial for the charts page to load correctly
      await new Promise(resolve => setTimeout(resolve, 150));
      
      onSuccess();
    } catch (error: any) {
      console.error("❌ Fast Login error:", error);
      
      // Handle different error types
      let errorMessage = Strings.fastLoginError;
      
      if (error?.status === 400) {
        errorMessage = Strings.fastLoginErrorValidation;
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

  const handleCancel = () => {
    if (!isLoading && !isSessionLocked) {
      setFastPassword("");
      onCancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && fastPassword.trim().length === 4) {
      handleSubmit();
    }
  };

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined style={{ color: "#1890ff" }} />
          <span>{isSessionLocked ? Strings.sessionLockedLoginTitle : Strings.fastLoginModalTitle}</span>
        </Space>
      }
      open={isVisible}
      onCancel={handleCancel}
      footer={[
        !isSessionLocked && (
          <Button key="cancel" onClick={handleCancel} disabled={isLoading}>
            {Strings.cancel}
          </Button>
        ),
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
          disabled={!fastPassword.trim() || fastPassword.length !== 4}
          icon={<KeyOutlined />}
        >
          {Strings.fastLoginButtonText}
        </Button>,
      ].filter(Boolean)}
      width={450}
      centered
      maskClosable={!isSessionLocked}
      closable={!isSessionLocked}
      destroyOnClose={false}
    >
      <div style={{ marginTop: '16px' }}>
        <Typography.Text strong>
          {Strings.fastLoginModalDescription}
        </Typography.Text>
        <Input.Password
          placeholder={Strings.fastLoginModalPlaceholder}
          value={fastPassword}
          onChange={(e) => {
            const value = e.target.value;
            // Only allow alphabetic characters and maintain case
            const filteredValue = value.replace(/[^A-Za-z]/g, '');
            setFastPassword(filteredValue);
          }}
          maxLength={4}
          style={{
            marginTop: '12px',
            fontSize: '18px',
            textAlign: 'center',
            letterSpacing: '4px'
          }}
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <Typography.Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
          El fast password debe tener exactamente 4 caracteres alfabéticos (A-Z, a-z).
        </Typography.Text>
        <Typography.Text type="warning" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
          ⚠️ {isSessionLocked ? Strings.sessionLockedWarning : Strings.fastPasswordLoginComplete}
        </Typography.Text>
      </div>
    </Modal>
  );
};

export default FastLoginModal;
