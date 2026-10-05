import React, { useEffect, useMemo, useState } from "react";
import {
  Divider,
  TreeSelect,
  Button,
  List,
  Typography,
  Empty,
  Spin,
  notification,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetlevelsMutation } from "../../../services/levelService";
import {
  useGetOplLevelsByOplIdQuery,
  useCreateOplLevelMutation,
  useDeleteOplLevelMutation,
} from "../../../services/cilt/assignaments/oplLevelService";
import { Level } from "../../../data/level/level";
import Strings from "../../../utils/localizations/Strings";

const { Text } = Typography;

interface OplLevelAssignmentProps {
  oplId?: number | string | null;
  siteId: number | string;
}

interface TreeNode {
  title: string;
  value: string;
  key: string;
  children: TreeNode[];
}

/**
 * Builds an Ant Design TreeSelect data structure from the flat level list.
 * Root nodes are those whose superiorId is "0" or empty (same rule used across the app).
 */
const buildLevelTree = (levels: Level[]): TreeNode[] => {
  const map: { [key: string]: TreeNode } = {};
  const roots: TreeNode[] = [];

  levels.forEach((level) => {
    map[level.id] = {
      title: level.name,
      value: String(level.id),
      key: String(level.id),
      children: [],
    };
  });

  levels.forEach((level) => {
    const superiorId = level.superiorId;
    if (superiorId === "0" || !superiorId) {
      roots.push(map[level.id]);
    } else if (map[superiorId]) {
      map[superiorId].children.push(map[level.id]);
    } else {
      // Orphan node (parent filtered out): surface it at root so it is still assignable.
      roots.push(map[level.id]);
    }
  });

  return roots;
};

const OplLevelAssignment: React.FC<OplLevelAssignmentProps> = ({
  oplId,
  siteId,
}) => {
  const [getLevels, { isLoading: isLoadingLevels }] = useGetlevelsMutation();
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | undefined>(
    undefined
  );

  const {
    data: oplLevelsData,
    isFetching: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useGetOplLevelsByOplIdQuery(Number(oplId), { skip: !oplId });

  const [createOplLevel, { isLoading: isAssigning }] =
    useCreateOplLevelMutation();
  const [deleteOplLevel] = useDeleteOplLevelMutation();

  // Level relations assigned to THIS opl (endpoint already scopes by opl).
  const assignedOplLevels: any[] = useMemo(() => {
    if (!oplId || !oplLevelsData) return [];
    return oplLevelsData;
  }, [oplLevelsData, oplId]);

  // Map of levelId -> level, used to walk up the superiorId chain.
  const levelById = useMemo(() => {
    const m: { [key: string]: Level } = {};
    levels.forEach((l) => {
      m[String(l.id)] = l;
    });
    return m;
  }, [levels]);

  /**
   * Builds the full breadcrumb path from the root down to the given level,
   * e.g. "Planta › Área › Equipo › Batería". Guards against cycles.
   */
  const buildLevelPath = (levelId: string | number): string => {
    const parts: string[] = [];
    let current: Level | undefined = levelById[String(levelId)];
    const seen = new Set<string>();
    while (current && !seen.has(String(current.id))) {
      seen.add(String(current.id));
      parts.unshift(current.name);
      const parentId: string = current.superiorId;
      if (!parentId || parentId === "0") break;
      current = levelById[String(parentId)];
    }
    return parts.length > 0 ? parts.join(" › ") : `${Strings.level} ${levelId}`;
  };

  const treeData = useMemo(() => buildLevelTree(levels), [levels]);

  useEffect(() => {
    if (siteId) {
      fetchLevels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const fetchLevels = async () => {
    try {
      const response = await getLevels({ siteId: String(siteId) }).unwrap();
      const activeLevels = (response || []).filter(
        (node: Level) => !(node as any).deletedAt && node.id !== "0"
      );
      setLevels(activeLevels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      setLevels([]);
    }
  };

  const handleAssign = async () => {
    if (!oplId) {
      notification.warning({
        message: Strings.warning,
        description: Strings.oplSaveOplBeforeAssigning,
      });
      return;
    }
    if (!selectedLevelId) {
      return;
    }

    const alreadyAssigned = assignedOplLevels.some(
      (ol) => String(ol.levelId) === String(selectedLevelId)
    );
    if (alreadyAssigned) {
      notification.info({
        message: Strings.oplAssignToNodeTitle,
        description: Strings.oplAlreadyAssignedToNode,
      });
      return;
    }

    try {
      const payload = {
        oplId: Number(oplId),
        levelId: Number(selectedLevelId),
        siteId: Number(siteId),
      };
      await createOplLevel(payload).unwrap();
      notification.success({
        message: Strings.success,
        description: Strings.oplAssignmentSuccess,
      });
      setSelectedLevelId(undefined);
      refetchAssignments();
    } catch (error) {
      console.error("Error assigning OPL to node:", error);
      notification.error({
        message: Strings.error,
        description: Strings.oplErrorAssigning,
      });
    }
  };

  const handleUnassign = async (id: number) => {
    try {
      await deleteOplLevel(id).unwrap();
      notification.success({
        message: Strings.success,
        description: Strings.oplUnassignSuccess,
      });
      refetchAssignments();
    } catch (error) {
      console.error("Error unassigning node:", error);
      notification.error({
        message: Strings.error,
        description: Strings.oplErrorUnassigning,
      });
    }
  };

  return (
    <div>
      <Divider orientation="left" style={{ marginTop: 8 }}>
        {Strings.oplAssignToNodeTitle}
      </Divider>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <TreeSelect
          style={{ flex: 1 }}
          treeData={treeData}
          value={selectedLevelId}
          placeholder={Strings.oplAssignToNodePlaceholder}
          onChange={(value) => setSelectedLevelId(value)}
          loading={isLoadingLevels}
          showSearch
          allowClear
          treeNodeFilterProp="title"
          treeDefaultExpandAll={false}
          disabled={!oplId}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAssign}
          loading={isAssigning}
          disabled={!oplId || !selectedLevelId}
        >
          {Strings.assign}
        </Button>
      </div>

      {selectedLevelId && (
        <Text type="secondary" style={{ display: "block", marginTop: 6 }}>
          {buildLevelPath(selectedLevelId)}
        </Text>
      )}

      {!oplId && (
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          {Strings.oplSaveOplBeforeAssigning}
        </Text>
      )}

      <div style={{ marginTop: 16 }}>
        <Text strong>{Strings.oplAssignedNodesTitle}</Text>
        <Spin spinning={isLoadingAssignments}>
          {assignedOplLevels.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={Strings.oplNoAssignedNodes}
              style={{ margin: "12px 0" }}
            />
          ) : (
            <List
              size="small"
              style={{ marginTop: 8 }}
              dataSource={assignedOplLevels}
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
                    {buildLevelPath(item.levelId)}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={Number(item.usageCount) > 0 ? "blue" : "default"}>
                      {Strings.oplNodeTimesUsed}: {Number(item.usageCount) || 0}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default OplLevelAssignment;
