import React, { useState } from 'react';
import { Button, App as AntApp } from "antd";
import { FormInstance } from 'antd/es/form';
import Strings from '../../../utils/localizations/Strings';
import { CiltFrequency } from '../../../data/cilt/ciltFrequencies/ciltFrequencies';
import { useLocation } from 'react-router-dom';
import { useCreateCiltFrequencyMutation, useUpdateCiltFrequencyMutation } from '../../../services/cilt/ciltFrequenciesService';
import { CreateCiltFrequencies, UpdateCiltFrequencies } from '../../../data/cilt/ciltFrequencies/ciltFrequencies.request';
import AnatomyNotification, { AnatomyNotificationType, } from "../../components/AnatomyNotification";
import ModalForm from '../../components/ModalForm';
import CiltFrequenciesFormCard from './CiltFrequenciesFormCard';

interface CiltFrequenciesFormProps {
  formType: CiltFrequenciesFormType;
  data?: CiltFrequency;
  onComplete?: () => void;
}

export enum CiltFrequenciesFormType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

const CiltFrequenciesForm = ({
  formType,
  data,
  onComplete,
}: CiltFrequenciesFormProps): React.ReactElement => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const [registerCiltFrequency] = useCreateCiltFrequencyMutation();
  const [updateCiltFrequency] = useUpdateCiltFrequencyMutation();

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
      case CiltFrequenciesFormType.CREATE:
        await handleOnCreate(values);
        break;
      case CiltFrequenciesFormType.UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);
      await registerCiltFrequency(
        new CreateCiltFrequencies(
          Number(location.state.siteId),
          values.frecuencyCode.trim(),
          values.description.trim(),
          values.status
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
        new UpdateCiltFrequencies(
          Number(data?.id),
          Number(location.state.siteId),
          values.frecuencyCode.trim(),
          values.description.trim(),
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
        type={formType == CiltFrequenciesFormType.CREATE ? "primary" : "default"}
      >
        {formType == CiltFrequenciesFormType.CREATE ? Strings.create : Strings.edit}
      </Button>

      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={
          formType == CiltFrequenciesFormType.CREATE
            ? Strings.addCiltFrequency
            : Strings.editCiltFrequency
        }
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <CiltFrequenciesFormCard
            form={form}
            onSubmit={handleOnSubmit}
            initialValues={data}
            enableStatus={formType === CiltFrequenciesFormType.UPDATE}
          />

        )}
      />
    </>
  );
};
export default CiltFrequenciesForm;
