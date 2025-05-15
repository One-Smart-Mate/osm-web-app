import React, { useState } from 'react';
import { Button, App as AntApp } from "antd";
import { FormInstance } from 'antd/es/form';
import Strings from '../../../utils/localizations/Strings';
import { useLocation } from 'react-router-dom';
import AnatomyNotification, { AnatomyNotificationType, } from "../../components/AnatomyNotification";
import ModalForm from '../../components/ModalForm';
import { CiltType } from '../../../data/cilt/ciltTypes/ciltTypes';
import { useCreateCiltTypeMutation, useUpdateCiltTypeMutation } from '../../../services/cilt/ciltTypesService';
import { CreateCiltTypes, UpdateCiltTypes } from '../../../data/cilt/ciltTypes/ciltTypes.request';
import CiltTypesFormCard from './CiltTypesFormCard';

interface CiltTypesFormProps {
  formType: CiltTypesFormType;
  data?: CiltType;
  onComplete?: () => void;
}

export enum CiltTypesFormType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

const CiltTypesForm = ({
  formType,
  data,
  onComplete,
}: CiltTypesFormProps): React.ReactElement => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const [registerCiltFrequency] = useCreateCiltTypeMutation();
  const [updateCiltFrequency] = useUpdateCiltTypeMutation();

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
      case CiltTypesFormType.CREATE:
        await handleOnCreate(values);
        break;
      case CiltTypesFormType.UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);
      console.log('Status value:', values.status);
      await registerCiltFrequency(
        new CreateCiltTypes(
          Number(location.state.siteId),
          values.name.trim(),
          values.status,
          values.color.trim(),
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
      await updateCiltFrequency(
        new UpdateCiltTypes(
          Number(data?.id),
          Number(location.state.siteId),
          values.name.trim(),
          values.status,
          values.color.trim(),
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

  const fixedData = data ? {
    ...data,
    color: data.color?.startsWith('#') ? data.color : `#${data.color}`
  } : undefined;
  


  return (
    <>
      <Button
        onClick={handleOnClickButton}
        type={formType == CiltTypesFormType.CREATE ? "primary" : "default"}
      >
        {formType == CiltTypesFormType.CREATE ? Strings.create : Strings.edit}
      </Button>

      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={
          formType == CiltTypesFormType.CREATE
            ? Strings.addCiltType
            : Strings.editCiltType
        }
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <CiltTypesFormCard
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={fixedData}
            enableStatus={formType === CiltTypesFormType.UPDATE}
          />

        )}
      />
    </>
  );
};
export default CiltTypesForm;
