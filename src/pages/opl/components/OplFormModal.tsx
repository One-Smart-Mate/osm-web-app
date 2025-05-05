import React from "react";
import { Modal, Button } from "antd";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import OplForm from "./OplForm";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";

interface OplFormModalProps {
  visible: boolean;
  isViewMode: boolean;
  currentOpl: OplMstr | null;
  form: any;
  loadingUsers: boolean;
  responsibles: Responsible[];
  onCancel: () => void;
  onSubmit: () => void;
}

const OplFormModal: React.FC<OplFormModalProps> = ({
  visible,
  isViewMode,
  currentOpl,
  form,
  loadingUsers,
  responsibles,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title={
        currentOpl
          ? isViewMode
            ? Strings.oplFormModalViewTitle
            : Strings.oplFormModalEditTitle
          : Strings.oplFormModalCreateTitle
      }
      open={visible}
      onCancel={onCancel}
      footer={
        isViewMode
          ? [
              <Button key="back" onClick={onCancel}>
                {Strings.oplFormModalCloseButton}
              </Button>,
            ]
          : [
              <Button key="back" onClick={onCancel}>
                {Strings.oplFormModalCancelButton}
              </Button>,
              <Button key="submit" type="primary" onClick={onSubmit}>
                {Strings.oplFormModalSaveButton}
              </Button>,
            ]
      }
      width={700}
    >
      <OplForm
        form={form}
        isViewMode={isViewMode}
        loadingUsers={loadingUsers}
        responsibles={responsibles}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default OplFormModal;
