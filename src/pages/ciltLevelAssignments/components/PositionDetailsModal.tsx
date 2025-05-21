import React from "react";
import { Modal, Descriptions, Badge } from "antd";
import { Position } from "../../../data/postiions/positions";
import Strings from "../../../utils/localizations/Strings";

interface PositionDetailsModalProps {
  visible: boolean;
  position: Position | null;
  onCancel: () => void;
}

const PositionDetailsModal: React.FC<PositionDetailsModalProps> = ({
  visible,
  position,
  onCancel,
}) => {
  if (!position) return null;

  return (
    <Modal
      title={`${Strings.details}: ${position.name}`}
      open={visible}
      onCancel={(e) => {
        // Evitar que el evento se propague y afecte al dropdown
        e?.stopPropagation();
        onCancel();
      }}
      maskClosable={false}
      footer={null}
      width={700}
    >

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label={Strings.ciltMstrPositionLabel}>
          {position.name}
        </Descriptions.Item>
        <Descriptions.Item label="ID">
          {position.id}
        </Descriptions.Item>
        <Descriptions.Item label="Site">
          {position.siteName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.description}>
          {position.description || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.status}>
          <Badge
            status={position.status === "A" ? "success" : "error"}
            text={
              position.status === "A"
                ? Strings.ciltMstrListActiveFilter
                : Strings.ciltMstrListSuspendedFilter
            }
          />
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default PositionDetailsModal;
