import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { Button, App as AntApp } from "antd";
import ModalForm from "../../components/ModalForm";
import { FormInstance } from "antd/lib";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../components/AnatomyNotification";
import { OplTypes } from "../../../data/oplTypes/oplTypes";
import OplTypeFormCard from "./OplTypeFormCard";
import {
  useCreateOplTypeMutation,
  useUpdateOplTypeMutation,
} from "../../../services/oplTypesService";
import { useAppSelector } from "../../../core/store";
import { selectSiteId } from "../../../core/genericReducer";
import useCurrentUser from "../../../utils/hooks/useCurrentUser";

interface OplTypeFormProps {
  formType: OplTypeFormType;
  data?: OplTypes;
  onComplete?: () => void;
}

export enum OplTypeFormType {
  _CREATE = "CREATE",
  _UPDATE = "UPDATE",
}

const OplTypeForm = ({ data, onComplete, formType }: OplTypeFormProps) => {
  const [createOplType] = useCreateOplTypeMutation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { notification } = AntApp.useApp();
  const [updateOplType] = useUpdateOplTypeMutation();
  const siteIdFromSelector = useAppSelector(selectSiteId);
  const { user } = useCurrentUser();

  // Get siteId from selector or from user's first site as fallback
  const siteId = siteIdFromSelector || (user?.sites?.[0]?.id);

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
      case OplTypeFormType._CREATE:
        await handleOnCreate(values);
        break;
      case OplTypeFormType._UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);


      // Validate siteId
      if (!siteId || siteId === '' || Number(siteId) === 0) {
        AnatomyNotification.error(notification, 'Error: No site selected. Please select a site before creating an OPL type.');
        setIsLoading(false);
        return;
      }

      // Clean the document type - remove all non-printable characters and normalize
      const rawDocumentType = values.documentType || "";
      let documentType = rawDocumentType
        .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Remove non-printable and unusual Unicode
        .trim()
        .replace(/\s+/g, ' '); // Normalize whitespace

      // Ensure it doesn't exceed 50 characters after cleaning
      if (documentType.length > 50) {
        documentType = documentType.substring(0, 50).trim();
        AnatomyNotification.error(notification, `Document type was truncated to 50 characters: "${documentType}"`);
      }

      if (documentType.length === 0) {
        AnatomyNotification.error(notification, Strings.requiredDocumentType);
        setIsLoading(false);
        return;
      }

      const createOplData = {
        siteId: Number(siteId!),
        documentType: documentType,
        status: 'A',
        createdAt: new Date().toISOString()
      };

      await createOplType(createOplData).unwrap();
      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType._REGISTER,
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
      let documentType = rawDocumentType
        .replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '') // Remove non-printable and unusual Unicode
        .trim()
        .replace(/\s+/g, ' '); // Normalize whitespace

      // Ensure it doesn't exceed 50 characters after cleaning
      if (documentType.length > 50) {
        documentType = documentType.substring(0, 50).trim();
        AnatomyNotification.error(notification, `Document type was truncated to 50 characters: "${documentType}"`);
      }

      if (documentType.length === 0) {
        AnatomyNotification.error(notification, Strings.requiredDocumentType);
        setIsLoading(false);
        return;
      }
      
      const parsedId = parseInt(values.id, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        AnatomyNotification.error(notification, Strings.invalidId);
        setIsLoading(false);
        return;
      }
      const updateOplData = {
        id: parsedId,
        siteId: Number(siteId!),
        documentType: documentType,
        status: values.status,
        updatedAt: new Date().toISOString()
      };

      await updateOplType(updateOplData).unwrap();
      setModalOpen(false);
      onComplete?.();
      AnatomyNotification.success(notification, AnatomyNotificationType._UPDATE);
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
        type={formType == OplTypeFormType._CREATE ? "primary" : "default"}
      >
        {formType == OplTypeFormType._CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={formType == OplTypeFormType._CREATE ? Strings.createOplType : Strings.updateOplType}
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <OplTypeFormCard
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={data}
            enableStatus={formType == OplTypeFormType._UPDATE}
          />
        )}
      />
    </>
  );
};

export default OplTypeForm; 