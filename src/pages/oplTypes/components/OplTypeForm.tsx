import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { Button, App as AntApp } from "antd";
import ModalForm from "../../components/ModalForm";
import { FormInstance } from "antd/lib";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../components/AnatomyNotification";
import { useTranslation } from "react-i18next";
import { OplTypes } from "../../../data/oplTypes/oplTypes";
import OplTypeFormCard from "./OplTypeFormCard";
import {
  useCreateOplTypeMutation,
  useUpdateOplTypeMutation,
} from "../../../services/oplTypesService";
import {
  CreateOplType,
} from "../../../data/oplTypes/oplTypes.request";

interface OplTypeFormProps {
  formType: OplTypeFormType;
  data?: OplTypes;
  onComplete?: () => void;
}

export enum OplTypeFormType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

const OplTypeForm = ({ data, onComplete, formType }: OplTypeFormProps) => {
  const [createOplType] = useCreateOplTypeMutation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { notification } = AntApp.useApp();
  const [updateOplType] = useUpdateOplTypeMutation();
  const { t } = useTranslation();

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
      case OplTypeFormType.CREATE:
        await handleOnCreate(values);
        break;
      case OplTypeFormType.UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);
      // Clean the document type - remove all non-printable characters and normalize
      const rawDocumentType = values.documentType || "";
      const documentType = rawDocumentType
        .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Remove non-printable and unusual Unicode
        .trim()
        .replace(/\s+/g, ' '); // Normalize whitespace
      
      if (documentType.length === 0) {
        AnatomyNotification.error(notification, Strings.requiredDocumentType);
        setIsLoading(false);
        return;
      }
      
      if (documentType.length > 50) {
        AnatomyNotification.error(notification, Strings.documentTypeTooLong);
        setIsLoading(false);
        return;
      }
      await createOplType(new CreateOplType(documentType)).unwrap();
      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType.REGISTER,
        t
      );
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnUpdate = async (values: any) => {
    try {
      setIsLoading(true);
      // Clean the document type - remove all non-printable characters and normalize
      const rawDocumentType = values.documentType || "";
      const documentType = rawDocumentType
        .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Remove non-printable and unusual Unicode
        .trim()
        .replace(/\s+/g, ' '); // Normalize whitespace
      
      if (documentType.length === 0) {
        AnatomyNotification.error(notification, Strings.requiredDocumentType);
        setIsLoading(false);
        return;
      }
      
      if (documentType.length > 50) {
        AnatomyNotification.error(notification, Strings.documentTypeTooLong);
        setIsLoading(false);
        return;
      }
      
      const parsedId = parseInt(values.id, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        AnatomyNotification.error(notification, Strings.invalidId);
        setIsLoading(false);
        return;
      }
      await updateOplType({
        id: parsedId,
        documentType: documentType,
        status: values.status,
        updatedAt: new Date().toISOString()
      }).unwrap();
      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(notification, AnatomyNotificationType.UPDATE, t);
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOnClickButton}
        type={formType == OplTypeFormType.CREATE ? "primary" : "default"}
      >
        {formType == OplTypeFormType.CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={formType == OplTypeFormType.CREATE ? Strings.createOplType : Strings.updateOplType}
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <OplTypeFormCard
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={data}
            enableStatus={formType == OplTypeFormType.UPDATE}
          />
        )}
      />
    </>
  );
};

export default OplTypeForm; 