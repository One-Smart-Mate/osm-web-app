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
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const [registerUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleOnClickButton = () => {
    setModalOpen(true);
  };

  const handleOnCancelButton = () => {
    if (!isLoading) {
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

    const userData = {
      id: Number(values.id),
      name: values.name.trim(),
      email: values.email.trim(),
      siteId: Number(location.state.siteId),
      password: values.password,
      uploadCardDataWithDataNet: enableEvidences,
      uploadCardEvidenceWithDataNet: enableEvidences,
      roles: values.roles,
      status: values.status,
      fastPassword: values.fastPassword,
      phoneNumber: values.phoneNumber?.trim() || '',
      translation: values.translation || 'ES'
    };

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
        key={`${formType}-${data?.id || 'new'}`}
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
