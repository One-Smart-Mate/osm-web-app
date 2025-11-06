import { Button, App as AntApp } from "antd";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../components/AnatomyNotification";
import Strings from "../../../utils/localizations/Strings";
import ModalForm from "../../components/ModalForm";
import { FormInstance } from "antd/lib";
import UserFormCard from "./UserFormCard";
import { UserCardInfo } from "../../../data/user/user";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../services/userService";
import { UserFormType } from "./UserFormTypes";

interface UserFormProps {
  formType: UserFormType;
  data?: UserCardInfo;
  onComplete?: () => void;
}

const UserForm = ({
  formType,
  data,
  onComplete,
}: UserFormProps): React.ReactElement => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalKey, setModalKey] = useState(0); // Force re-render when modal opens
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const [registerUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleOnClickButton = () => {
    console.log('[UserForm] Opening modal for user:', data?.id || 'new user');
    console.log('[UserForm] User data:', data);
    // Increment key to force form re-mount
    setModalKey(prev => prev + 1);
    setModalOpen(true);
  };

  const handleOnCancelButton = () => {
    if (!isLoading) {
      console.log('[UserForm] Closing modal');
      setModalOpen(false);
    }
  };

  const handleOnSubmit = async (values: any) => {
    switch (formType) {
      case UserFormType._CREATE:
        await handleOnCreate(values);
        break;
      case UserFormType._UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    setIsLoading(true);
    const enableEvidences = values.enableEvidences ? 1 : 0;

    const userData = {
      name: values.name.trim(),
      email: values.email.trim(),
      siteId: Number(location.state.siteId),
      password: values.password,
      uploadCardDataWithDataNet: enableEvidences,
      uploadCardEvidenceWithDataNet: enableEvidences,
      roles: values.roles,
      phoneNumber: values.phoneNumber?.trim() || '',
      translation: values.translation || 'ES'
    };

    registerUser(userData)
      .unwrap()
      .then(() => {
        // Success - close modal and show notification
        setIsLoading(false);
        setModalOpen(false);

        AnatomyNotification.success(
          notification,
          AnatomyNotificationType._REGISTER
        );

        // Call onComplete immediately - no delay needed
        if (onComplete) {
          onComplete();
        }
      })
      .catch((error) => {
        // Error
        console.error("Error creating user:", error);
        setIsLoading(false);
        AnatomyNotification.error(notification, error);
      });
  };

  const handleOnUpdate = async (values: any) => {
    setIsLoading(true);
    const enableEvidences = values.enableEvidences ? 1 : 0;

    // Only include the specific fields that the backend expects
    const userData: any = {
      id: Number(values.id),
      name: values.name.trim(),
      email: values.email.trim(),
      siteId: Number(location.state.siteId),
      uploadCardDataWithDataNet: enableEvidences,
      uploadCardEvidenceWithDataNet: enableEvidences,
      roles: values.roles,
      status: values.status,
      phoneNumber: values.phoneNumber?.trim() || '',
      translation: values.translation || 'ES'
    };

    // Only include password if it was provided
    if (values.password && values.password.trim()) {
      userData.password = values.password;
    }

    // Only include fastPassword if it was provided and is valid
    if (values.fastPassword && values.fastPassword.trim()) {
      userData.fastPassword = values.fastPassword.trim();
    }

    updateUser(userData)
      .unwrap()
      .then(() => {
        // Success - close modal and show notification
        setIsLoading(false);
        setModalOpen(false);

        AnatomyNotification.success(notification, AnatomyNotificationType._UPDATE);

        // Call onComplete immediately - no delay needed
        if (onComplete) {
          onComplete();
        }
      })
      .catch((error) => {
        // Error
        console.error("Error updating user:", error);
        setIsLoading(false);
        AnatomyNotification.error(notification, error);
      });
  };

  return (
    <>
      <Button
        onClick={handleOnClickButton}
        type={formType == UserFormType._CREATE ? "primary" : "default"}
      >
        {formType == UserFormType._CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        key={`${formType}-${data?.id || 'new'}-${modalKey}`}
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={
          formType == UserFormType._CREATE
            ? Strings.createUser
            : Strings.updateUser
        }
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <UserFormCard
            key={`user-form-card-${modalKey}`}
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={data}
            enableStatus={formType == UserFormType._UPDATE}
          />
        )}
      />
    </>
  );
};
export default UserForm;
