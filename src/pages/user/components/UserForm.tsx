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
import { CreateUser, UpdateUser } from "../../../data/user/user.request";

interface UserFormProps {
  formType: UserFormType;
  data?: UserCardInfo;
  onComplete?: () => void;
}

export enum UserFormType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
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
      case UserFormType.CREATE:
        await handleOnCreate(values);
        break;
      case UserFormType.UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);
      const enableEvidences = values.enableEvidences ? 1 : 0;
      await registerUser(
        new CreateUser(
          values.name.trim(),
          values.email.trim(),
          Number(location.state.siteId),
          values.password,
          enableEvidences,
          enableEvidences,
          values.roles
        )
      ).unwrap();

      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType.REGISTER
      );
    } catch (error) {
      console.error("Error creating priority:", error);
      AnatomyNotification.error(notification, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnUpdate = async (values: any) => {
    try {
      setIsLoading(true);
      const enableEvidences = values.enableEvidences ? 1 : 0;
      await updateUser(
        new UpdateUser(
          Number(values.id),
          values.name.trim(),
          values.email.trim(),
          Number(location.state.siteId),
          values.password,
          enableEvidences,
          enableEvidences,
          values.roles,
          values.status
        )
      ).unwrap();
      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(notification, AnatomyNotificationType.UPDATE);
    } catch (error) {
      console.error("Error updating company:", error);
      AnatomyNotification.error(notification, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOnClickButton}
        type={formType == UserFormType.CREATE ? "primary" : "default"}
      >
        {formType == UserFormType.CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={
          formType == UserFormType.CREATE
            ? Strings.createUser
            : Strings.updateUser
        }
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <UserFormCard
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={data}
            enableStatus={formType == UserFormType.UPDATE}
          />
        )}
      />
    </>
  );
};
export default UserForm;
