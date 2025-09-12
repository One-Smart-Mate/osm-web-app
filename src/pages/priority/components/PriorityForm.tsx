import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { Button, App as AntApp } from "antd";
import ModalForm from "../../components/ModalForm";
import { FormInstance } from "antd/lib";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../components/AnatomyNotification";
import { Priority } from "../../../data/priority/priority";
import PriorityFormCard from "./PriorityFormCard";
import {
  useCreatePriorityMutation,
  useUpdatePriorityMutation,
} from "../../../services/priorityService";
import {
  CreatePriority,
  UpdatePriorityReq,
} from "../../../data/priority/priority.request";
import { useLocation } from "react-router-dom";

interface PriorityFormProps {
  formType: PriorityFormType;
  data?: Priority;
  onComplete?: () => void;
}

export enum PriorityFormType {
  _CREATE = "CREATE",
  _UPDATE = "UPDATE",
}

const PriorityForm = ({ data, onComplete, formType }: PriorityFormProps) => {
  const [registerPriority] = useCreatePriorityMutation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const [updatePriority] = useUpdatePriorityMutation();

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
      case PriorityFormType._CREATE:
        await handleOnCreate(values);
        break;
      case PriorityFormType._UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);
      await registerPriority(
        new CreatePriority(
          Number(location?.state?.siteId),
          values.code.trim(),
          values.description.trim(),
          Number(values.days)
        )
      ).unwrap();
      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType._REGISTER
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
      await updatePriority(
        new UpdatePriorityReq(
          Number(values.id),
          values.code.trim(),
          values.description,
          Number(values.days),
          values.status
        )
      ).unwrap();
      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(notification, AnatomyNotificationType._UPDATE);
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
        type={formType == PriorityFormType._CREATE ? "primary" : "default"}
      >
        {formType == PriorityFormType._CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={Strings.createCompany}
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <PriorityFormCard
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={data}
            enableStatus={formType == PriorityFormType._UPDATE}
          />
        )}
      />
    </>
  );
};

export default PriorityForm;
