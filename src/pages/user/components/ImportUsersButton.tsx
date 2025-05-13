import { Button, Form, App as AntApp } from "antd";
import ModalForm from "../../../components/ModalForm";
import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { UploadOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { FormInstance } from "antd/lib";
import ImportUsersFormCard from "./ImportUsersFormCard";
import { useImportUsersMutation } from "../../../services/userService";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../components/AnatomyNotification";

interface ImportUsersButtonProps {
  onComplete?: () => void;
}

const ImportUsersButton = ({
  onComplete,
}: ImportUsersButtonProps): React.ReactElement => {
  const [importUsers] = useImportUsersMutation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location.state.siteId || Strings.empty;

  const handleOnFormFinish = async (values: any) => {
    try {
      setLoading(true);
      const { fileObj } = values;
      const file = fileObj.fileList[0].originFileObj;
      await importUsers({ file, siteId }).unwrap();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType.REGISTER
      );
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setLoading(false);
      setModalOpen(false);
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
        onClick={() => setModalOpen(true)}
        type="default"
        className="w-full md:w-auto"
      >
        <UploadOutlined />
        {Strings.importUsers}
      </Button>

      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={(form: FormInstance) => (
            <ImportUsersFormCard form={form} />
          )}
          title={`${Strings.importUsersFor} ${siteName}`}
          isLoading={isLoading}
        />
      </Form.Provider>
    </>
  );
};

export default ImportUsersButton;
