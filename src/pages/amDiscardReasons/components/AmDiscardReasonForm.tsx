import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { Button, App as AntApp, Form } from "antd";
import ModalForm from "../../components/ModalForm";
import { FormInstance } from "antd/lib";
// AnatomyNotification removed - using direct notification API
import { AmDiscardReason } from "../../../data/amDiscardReason/amDiscardReason";
import AmDiscardReasonFormCard from "./AmDiscardReasonFormCard";
import {
  useCreateAmDiscardReasonMutation,
  useUpdateAmDiscardReasonMutation,
} from "../../../services/amDiscardReasonService";
import {
  CreateAmDiscardReasonDTO,
  UpdateAmDiscardReasonDTO,
} from "../../../data/amDiscardReason/amDiscardReason";
import { useLocation } from "react-router-dom";

interface AmDiscardReasonFormProps {
  formType: AmDiscardReasonFormType;
  amDiscardReason?: AmDiscardReason;
  onComplete?: () => void;
}

export enum AmDiscardReasonFormType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

const AmDiscardReasonForm = ({ amDiscardReason, onComplete, formType }: AmDiscardReasonFormProps) => {
  const [createAmDiscardReason] = useCreateAmDiscardReasonMutation();
  const [updateAmDiscardReason] = useUpdateAmDiscardReasonMutation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { notification } = AntApp.useApp();

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
      case AmDiscardReasonFormType.CREATE:
        await handleOnCreate(values);
        break;
      case AmDiscardReasonFormType.UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);
      const createData: CreateAmDiscardReasonDTO = {
        siteId: Number(location?.state?.siteId),
        discardReason: values.discardReason.trim(),
        createdAt: new Date().toISOString(),
      };
      
      await createAmDiscardReason(createData).unwrap();
      setModalOpen(false);
      onComplete?.();
      notification.success({
        message: Strings.notificationSuccessTitle,
        description: Strings.amDiscardReasonCreatedSuccessfully,
      });
          } catch (error) {
        console.error("Error creating AM discard reason:", error);
        notification.error({
          message: Strings.notificationErrorTitle,
          description: Strings.amDiscardReasonCreateError,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnUpdate = async (values: any) => {
    try {
      setIsLoading(true);
      const updateData: UpdateAmDiscardReasonDTO = {
        id: Number(amDiscardReason?.id || values.id),
        siteId: Number(location?.state?.siteId),
        discardReason: values.discardReason?.trim(),
        updatedAt: new Date().toISOString(),
      };
      
      await updateAmDiscardReason(updateData).unwrap();
      setModalOpen(false);
      onComplete?.();
      notification.success({
        message: Strings.notificationSuccessTitle,
        description: Strings.amDiscardReasonUpdatedSuccessfully,
      });
          } catch (error) {
        console.error("Error updating AM discard reason:", error);
        notification.error({
          message: Strings.notificationErrorTitle,
          description: Strings.amDiscardReasonUpdateError,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    return formType === AmDiscardReasonFormType.CREATE 
      ? Strings.createAmDiscardReason 
      : Strings.updateAmDiscardReason;
  };

  // For UPDATE mode, render only the form without button/modal wrapper
  if (formType === AmDiscardReasonFormType.UPDATE) {
    const [form] = Form.useForm();
    return (
      <div>
        <AmDiscardReasonFormCard
          form={form}
          onSubmit={handleOnSubmit}
          initialValues={amDiscardReason}
          formType={formType}
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button 
            type="primary" 
            onClick={() => form.submit()}
            loading={isLoading}
          >
            {Strings.save}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handleOnClickButton}
        type={formType === AmDiscardReasonFormType.CREATE ? "primary" : "default"}
      >
        {formType === AmDiscardReasonFormType.CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={getTitle()}
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <AmDiscardReasonFormCard
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={amDiscardReason}
            formType={formType}
          />
        )}
      />
    </>
  );
};

export default AmDiscardReasonForm; 