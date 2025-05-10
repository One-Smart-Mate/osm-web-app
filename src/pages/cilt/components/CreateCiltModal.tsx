import React from "react";
import { Modal } from "antd";
import { Position } from "../../../data/postiions/positions";
import Strings from "../../../utils/localizations/Strings";
import CreateCiltForm from "../../positions/components/CreateCiltForm";

interface CreateCiltModalProps {
  visible: boolean;
  position: Position | null;
  form: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateCiltModal: React.FC<CreateCiltModalProps> = ({
  visible,
  position,
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
      {position && (
        <div className="mb-4">
          <p className="text-gray-500 mb-1">{Strings.ciltMstrPositionLabel}:</p>
          <p className="font-medium">{position.name}</p>
          <p className="text-sm text-gray-500">
            {position.areaName} - {position.levelName}
          </p>
        </div>
      )}

      <CreateCiltForm form={form} position={position} onSuccess={onSuccess} />
    </Modal>
  );
};

export default CreateCiltModal;
