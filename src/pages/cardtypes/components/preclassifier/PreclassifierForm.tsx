import { useState } from "react";
import { App as AntApp } from "antd";
import { useForm } from "antd/es/form/Form";
import PreclassifierFormCard from "./PreclassifierFormCard";
import Loading from "../../../components/Loading";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../../components/AnatomyNotification";
import {
  useCreatePreclassifierMutation,
  useUpdatePreclassifierMutation,
} from "../../../../services/preclassifierService";
import { CreatePreclassifier } from "../../../../data/preclassifier/preclassifier.request";
import Strings from "../../../../utils/localizations/Strings";

interface PreclassifierFormProps {
  formType: PreclassifierFormType;
  data?: any;
  onComplete?: () => void;
}

export enum PreclassifierFormType {
  _CREATE = "CREATE",
  _UPDATE = "UPDATE",
}

const PreclassifierForm = ({
  data,
  onComplete,
  formType,
}: PreclassifierFormProps) => {
  const { notification } = AntApp.useApp();
  const [form] = useForm();
  const [isLoading, setLoading] = useState(false);
  const [createPreclassifier] = useCreatePreclassifierMutation();
  const [updatePreclassifier] = useUpdatePreclassifierMutation();

  const handleOnSubmit = async (values: any) => {
    setLoading(true);
    switch (formType) {
      case PreclassifierFormType._CREATE:
        await handleOnCreate(values);
        break;
      case PreclassifierFormType._UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      if (!data.cardTypeId) {
        AnatomyNotification.error(
          notification,
          Strings.cardTypesNoCardTypeIdError
        );
        return;
      }
      const preclassifier = new CreatePreclassifier(
        values.code?.trim() || Strings.empty,
        values.description?.trim() || Strings.empty,
        Number(data.cardTypeId)
      );
      await createPreclassifier(preclassifier).unwrap();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType._REGISTER
      );
      form.resetFields();
      onComplete?.();
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnUpdate = async (values: any) => {
    try {
      const request = {
        id: Number(values.id),
        preclassifierCode: values.code?.trim() || Strings.empty,
        preclassifierDescription: values.description?.trim() || Strings.empty,
        status: values.status || Strings.activeStatus,
      };
      await updatePreclassifier(request).unwrap();
      AnatomyNotification.success(notification, AnatomyNotificationType._UPDATE);
      form.resetFields();
      onComplete?.();
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      {!isLoading && (
        <PreclassifierFormCard
          form={form}
          onSubmit={handleOnSubmit}
          initialValues={data}
          enableStatus={formType == PreclassifierFormType._UPDATE}
        />
      )}
    </>
  );
};

export default PreclassifierForm;
