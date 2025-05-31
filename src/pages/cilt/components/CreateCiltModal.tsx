import React from "react";
import { Modal } from "antd";
import Strings from "../../../utils/localizations/Strings";
import CreateCiltForm from "../../positions/components/CreateCiltForm";

interface CreateCiltModalProps {
  visible: boolean;
  form: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateCiltModal: React.FC<CreateCiltModalProps> = ({
  visible,
  form,
  onCancel,
  onSuccess,
}) => {
  return (
    <Modal
      title={Strings.ciltMstrCreateModalTitle}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <CreateCiltForm form={form} onSuccess={onSuccess} />
    </Modal>
  );
};

export default CreateCiltModal;
