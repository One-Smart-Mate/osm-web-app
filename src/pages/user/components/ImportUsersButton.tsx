import { Button, Form, App as AntApp } from "antd";
import ModalForm from "../../components/ModalForm";
import { useState, useRef } from "react";
import Strings from "../../../utils/localizations/Strings";
import { UploadOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { FormInstance } from "antd/lib";
import ImportUsersFormCard from "./ImportUsersFormCard";
import { useImportUsersMutation } from "../../../services/userService";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../components/AnatomyNotification";
import { ImportUsersData } from "../../../data/user/import.users.response";

interface ImportUsersButtonProps {
  onComplete?: (_data: ImportUsersData) => void;
}

const ImportUsersButton = ({
  onComplete,
}: ImportUsersButtonProps): React.ReactElement => {
  const [importUsers] = useImportUsersMutation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const formRef = useRef<FormInstance | null>(null);
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location.state.siteId || Strings.empty;

  const handleOnFormFinish = async (values: any) => {
    if (!values?.fileObj) {
      AnatomyNotification.error(notification, 'Please select a file');
      return;
    }

    const file = values.fileObj.file || values.fileObj.fileList?.[0]?.originFileObj || values.fileObj;

    if (!file) {
      AnatomyNotification.error(notification, 'Could not get file');
      return;
    }

    setLoading(true);

    try {
      await importUsers({ file, siteId }).unwrap();

      // Success
      setModalOpen(false);
      setLoading(false);

      if (formRef.current) {
        formRef.current.resetFields();
      }

      AnatomyNotification.success(
        notification,
        AnatomyNotificationType._REGISTER
      );

      // Refresh after modal closes
      if (onComplete) {
        onComplete(null as any);
      }
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error?.data?.message || error?.message || 'Error importing users';
      AnatomyNotification.error(notification, errorMessage);
    }
  };

  const handleOnCancelButton = () => {
    if (!isLoading) {
      setModalOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setLoading(false); // Ensure loading is false when opening
          setModalOpen(true);
        }}
        type="default"
        className="w-full md:w-auto"
      >
        <UploadOutlined />
        {Strings.importUsers}
      </Button>

      <Form.Provider
        onFormFinish={(_, { values }) => {
          handleOnFormFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={(form: FormInstance) => {
            formRef.current = form;
            return <ImportUsersFormCard form={form} />;
          }}
          title={`${Strings.importUsersFor} ${siteName}`}
          isLoading={isLoading}
        />
      </Form.Provider>
    </>
  );
};

export default ImportUsersButton;
