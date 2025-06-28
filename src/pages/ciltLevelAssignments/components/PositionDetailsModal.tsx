import React from "react";
import { Modal, Descriptions, Badge, List, Typography, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Position } from "../../../data/postiions/positions";
import { Responsible } from "../../../data/user/user";
import { useGetPositionUsersQuery } from "../../../services/positionService";
import Strings from "../../../utils/localizations/Strings";

interface PositionDetailsModalProps {
  visible: boolean;
  position: Position | null;
  onCancel: () => void;
}

const { Text } = Typography;

// Componente para mostrar los usuarios de una posición
const PositionUsers = ({ positionId }: { positionId: string }) => {
  const { data: users = [], isLoading } = useGetPositionUsersQuery(positionId, {
    refetchOnMountOrArgChange: true
  });

  if (isLoading) {
    return <Spin size="small" />;
  }

  if (!users.length) {
    return <Text type="secondary">{Strings.noAssignedUsers || "No hay usuarios asignados"}</Text>;
  }

  return (
    <List
      size="small"
      bordered
      className="shadow-md rounded-md bg-white max-w-xs"
      dataSource={users}
      renderItem={(user: Responsible) => (
        <List.Item>
          <UserOutlined className="mr-2" /> {user.name}
        </List.Item>
      )}
    />
  );
};

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
        <Descriptions.Item label="ID">{position.id}</Descriptions.Item>
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
        <Descriptions.Item label={Strings.assignedUsers || "Usuarios asignados"}>
          <div className="mt-2">
            <PositionUsers positionId={position.id.toString()} />
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default PositionDetailsModal;
