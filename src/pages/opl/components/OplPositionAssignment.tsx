import React, { useMemo, useState } from "react";
import {
  Divider,
  Select,
  Button,
  List,
  Typography,
  Empty,
  Spin,
  notification,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetPositionsBySiteIdQuery } from "../../../services/positionService";
import {
  useGetPositionsByOplQuery,
  useAssignOplToPositionMutation,
  useRemoveOplPositionAssignmentMutation,
} from "../../../services/cilt/assignaments/oplTrainingService";
import { AssignOplToPositionDTO } from "../../../data/cilt/assignaments/oplTraining";
import Strings from "../../../utils/localizations/Strings";

const { Text } = Typography;
const { Option } = Select;

interface OplPositionAssignmentProps {
  oplId?: number | string | null;
  siteId: number | string;
}

/**
 * Assigns an OPL (course) to one or more positions. Every user that belongs
 * to an assigned position is required to take the OPL (training records are
 * generated server-side).
 */
const OplPositionAssignment: React.FC<OplPositionAssignmentProps> = ({
  oplId,
  siteId,
}) => {
  const [selectedPositionId, setSelectedPositionId] = useState<
    number | undefined
  >(undefined);

  const { data: positions = [], isLoading: isLoadingPositions } =
    useGetPositionsBySiteIdQuery(String(siteId), { skip: !siteId });

  const {
    data: assignedPositions = [],
    isFetching: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useGetPositionsByOplQuery(Number(oplId), { skip: !oplId });

  const [assignOplToPosition, { isLoading: isAssigning }] =
    useAssignOplToPositionMutation();
  const [removeAssignment] = useRemoveOplPositionAssignmentMutation();

  const activePositions = useMemo(
    () => (positions || []).filter((p: any) => !p.deletedAt && p.name),
    [positions]
  );

  const handleAssign = async () => {
    if (!oplId) {
      notification.warning({
        message: Strings.warning,
        description: Strings.oplSaveOplBeforeAssigningPosition,
      });
      return;
    }
    if (!selectedPositionId) return;

    const alreadyAssigned = assignedPositions.some(
      (ap) => Number(ap.positionId) === Number(selectedPositionId)
    );
    if (alreadyAssigned) {
      notification.info({
        message: Strings.oplAssignToPositionTitle,
        description: Strings.oplAlreadyAssignedToPosition,
      });
      return;
    }

    try {
      await assignOplToPosition(
        new AssignOplToPositionDTO(Number(oplId), Number(selectedPositionId))
      ).unwrap();
      notification.success({
        message: Strings.success,
        description: Strings.oplAssignmentSuccess,
      });
      setSelectedPositionId(undefined);
      refetchAssignments();
    } catch (error) {
      console.error("Error assigning OPL to position:", error);
      notification.error({
        message: Strings.error,
        description: Strings.oplErrorAssigning,
      });
    }
  };

  const handleUnassign = async (id: number) => {
    try {
      await removeAssignment(id).unwrap();
      notification.success({
        message: Strings.success,
        description: Strings.oplUnassignSuccess,
      });
      refetchAssignments();
    } catch (error) {
      console.error("Error unassigning position:", error);
      notification.error({
        message: Strings.error,
        description: Strings.oplErrorUnassigning,
      });
    }
  };

  return (
    <div>
      <Divider orientation="left" style={{ marginTop: 8 }}>
        {Strings.oplAssignToPositionTitle}
      </Divider>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Select
          style={{ flex: 1 }}
          value={selectedPositionId}
          placeholder={Strings.oplAssignToPositionPlaceholder}
          onChange={(value) => setSelectedPositionId(value)}
          loading={isLoadingPositions}
          showSearch
          allowClear
          optionFilterProp="children"
          disabled={!oplId}
        >
          {activePositions.map((position: any) => (
            <Option key={position.id} value={position.id}>
              {position.name}
            </Option>
          ))}
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAssign}
          loading={isAssigning}
          disabled={!oplId || !selectedPositionId}
        >
          {Strings.assign}
        </Button>
      </div>

      {!oplId && (
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          {Strings.oplSaveOplBeforeAssigningPosition}
        </Text>
      )}

      <div style={{ marginTop: 16 }}>
        <Text strong>{Strings.oplAssignedPositionsTitle}</Text>
        <Spin spinning={isLoadingAssignments}>
          {assignedPositions.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={Strings.oplNoAssignedPositions}
              style={{ margin: "12px 0" }}
            />
          ) : (
            <List
              size="small"
              style={{ marginTop: 8 }}
              dataSource={assignedPositions}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      key="remove"
                      title={Strings.remove}
                      okText={Strings.remove}
                      cancelText={Strings.cancel}
                      onConfirm={() => handleUnassign(item.id)}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                      >
                        {Strings.remove}
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Text>
                    {item.position?.name ?? `#${item.positionId}`}
                    {item.position?.route ? ` — ${item.position.route}` : ""}
                  </Text>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default OplPositionAssignment;
