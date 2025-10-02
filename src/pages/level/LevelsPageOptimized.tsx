import { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  Spin,
  Button,
  Space,
  Alert,
  Progress,
  Typography,
  Drawer,
  Form,
  Modal,
  App as AntdApp
} from "antd";
import {
  ExpandOutlined,
  CompressOutlined,
  ReloadOutlined,
  WarningOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../core/store";
import { setSiteId } from "../../core/genericReducer";
import {
  useGetLevelTreeLazyMutation,
  useGetChildrenLevelsMutation,
  useGetLevelStatsMutation,
  useCreateLevelMutation,
  useUdpateLevelMutation,
  useMoveLevelMutation,
} from "../../services/levelService";
import { LevelCache } from "../../utils/levelCache";
import Strings from "../../utils/localizations/Strings";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import LevelDetailsCard from "./components/LevelDetailsCard";
import LevelFormDrawer from "./components/LevelFormDrawer";
import AnatomyNotification from "../components/AnatomyNotification";
import { CreateNode, MoveLevelDto } from "../../data/level/level.request";

const { Title, Text, Paragraph } = Typography;

interface TreeNode {
  id: string;
  name: string;
  data: any;
  hasChildren: boolean;
  childrenCount: number;
  children: TreeNode[];
  isLoading?: boolean;
  isExpanded?: boolean;
}

const LevelsPageOptimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notification } = AntdApp.useApp();
  const { isIhAdmin, rol } = useCurrentUser();

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  // API Hooks
  const [getLevelTreeLazy] = useGetLevelTreeLazyMutation();
  const [getChildrenLevels] = useGetChildrenLevelsMutation();
  const [getLevelStats] = useGetLevelStatsMutation();
  const [createLevel] = useCreateLevelMutation();
  const [updateLevel] = useUdpateLevelMutation();
  const [moveLevel] = useMoveLevelMutation();

  // State
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<"create" | "update" | null>(null);
  const [movingNodeId, setMovingNodeId] = useState<string | null>(null);

  const siteId = location.state?.siteId;
  const siteName = location.state?.siteName || Strings.defaultSiteName;

  // Initialize page
  useEffect(() => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }

    dispatch(setSiteId(siteId));
    loadInitialData();
  }, [location.state]);

  // Load initial data with stats
  const loadInitialData = async () => {
    setIsLoading(true);
    setLoadingProgress(0);

    try {
      // First, get statistics to understand the data size
      setLoadingProgress(10);
      const cachedStats = await LevelCache.getStats(siteId);

      let statsData = cachedStats;
      if (!cachedStats) {
        const statsResponse = await getLevelStats(siteId.toString()).unwrap();
        statsData = statsResponse;
        await LevelCache.cacheStats(siteId, statsData);
      }

      setStats(statsData);
      setLoadingProgress(30);

      // Show warning for large datasets
      if (statsData.performanceWarning) {
        notification.warning({
          message: "Large Dataset Detected",
          description: `This site has ${statsData.totalLevels.toLocaleString()} levels. The tree will load on-demand for better performance.`,
          duration: 5,
        });
      }

      // Check cache first
      setLoadingProgress(50);
      const cachedTree = await LevelCache.getTreeNode(siteId, null, 2);

      if (cachedTree) {
        const formattedTree = formatTreeData(cachedTree);
        setTreeData(formattedTree);
        setLoadingProgress(100);
      } else {
        // Load only the first 2 levels initially
        setLoadingProgress(70);
        const response = await getLevelTreeLazy({
          siteId: siteId.toString(),
          depth: 2
        }).unwrap();

        await LevelCache.cacheTreeNode(siteId, null, 2, response.data);

        const formattedTree = formatTreeData(response.data);
        setTreeData(formattedTree);
        setLoadingProgress(100);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      notification.error({
        message: "Error Loading Levels",
        description: "Failed to load level data. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  // Format tree data for display
  const formatTreeData = (data: any[]): TreeNode[] => {
    return data.map(item => ({
      id: item.id.toString(),
      name: item.name,
      data: item,
      hasChildren: item.hasChildren || false,
      childrenCount: item.childrenCount || 0,
      children: item.children ? formatTreeData(item.children) : [],
      isExpanded: false,
      isLoading: false,
    }));
  };

  // Load children for a node
  const loadNodeChildren = async (node: TreeNode) => {
    if (node.children.length > 0 || !node.hasChildren) {
      return;
    }

    // Update loading state
    updateNodeInTree(node.id, { isLoading: true });

    try {
      // Check cache first
      const cachedChildren = await LevelCache.getCachedChildren(
        siteId,
        parseInt(node.id)
      );

      let children = cachedChildren;
      if (!cachedChildren) {
        const response = await getChildrenLevels({
          siteId: siteId.toString(),
          parentId: parseInt(node.id),
        }).unwrap();

        children = response;

        // Cache the children
        for (const child of children) {
          await LevelCache.cacheLevel(siteId, child);
        }
      }

      const formattedChildren = formatTreeData(children);
      updateNodeInTree(node.id, {
        children: formattedChildren,
        isLoading: false,
        isExpanded: true
      });

      // Add to expanded nodes set
      setExpandedNodes(prev => new Set(prev).add(node.id));
    } catch (error) {
      console.error("Error loading children:", error);
      updateNodeInTree(node.id, { isLoading: false });
      notification.error({
        message: "Error Loading Children",
        description: `Failed to load children for ${node.name}`,
      });
    }
  };

  // Update a node in the tree
  const updateNodeInTree = (nodeId: string, updates: Partial<TreeNode>) => {
    setTreeData(prevTree => {
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, ...updates };
          }
          if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prevTree);
    });
  };

  // Toggle node expansion
  const toggleNode = async (node: TreeNode) => {
    if (node.isExpanded) {
      // Collapse
      updateNodeInTree(node.id, { isExpanded: false });
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(node.id);
        return newSet;
      });
    } else {
      // Expand - load children if needed
      if (node.children.length === 0 && node.hasChildren) {
        await loadNodeChildren(node);
      } else {
        updateNodeInTree(node.id, { isExpanded: true });
        setExpandedNodes(prev => new Set(prev).add(node.id));
      }
    }
  };

  // Render tree node
  const renderTreeNode = (node: TreeNode, level: number = 0) => (
    <div key={node.id} style={{ marginLeft: level * 24 }}>
      <div
        style={{
          padding: '8px 12px',
          margin: '4px 0',
          backgroundColor: selectedNode?.id === node.id ? '#e6f7ff' : '#f0f0f0',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: movingNodeId === node.id ? '2px dashed #1890ff' : 'none',
        }}
        onClick={() => handleNodeClick(node)}
      >
        <Space>
          {node.hasChildren && (
            <Button
              size="small"
              type="text"
              icon={node.isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
              loading={node.isLoading}
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node);
              }}
            />
          )}
          <Text strong={selectedNode?.id === node.id}>
            {node.name}
          </Text>
          {node.childrenCount > 0 && (
            <Text type="secondary">({node.childrenCount})</Text>
          )}
        </Space>

        <Space>
          {movingNodeId && movingNodeId !== node.id && (
            <Button
              size="small"
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveNode(node.id);
              }}
            >
              Move Here
            </Button>
          )}
        </Space>
      </div>

      {node.isExpanded && node.children.map(child =>
        renderTreeNode(child, level + 1)
      )}
    </div>
  );

  // Handle node click
  const handleNodeClick = (node: TreeNode) => {
    setSelectedNode(node);
    if (!movingNodeId) {
      setDetailsVisible(true);
    }
  };

  // Handle create level
  const handleCreateLevel = () => {
    if (!selectedNode) return;

    createForm.setFieldsValue({
      superiorId: selectedNode.id === "0" ? null : selectedNode.id
    });
    setDrawerType("create");
    setDrawerVisible(true);
  };

  // Handle update level
  const handleUpdateLevel = () => {
    if (!selectedNode) return;

    updateForm.setFieldsValue(selectedNode.data);
    setDrawerType("update");
    setDrawerVisible(true);
  };

  // Handle move node
  const handleMoveNode = async (newParentId: string) => {
    if (!movingNodeId) return;

    try {
      setIsLoading(true);
      const dto = new MoveLevelDto(
        Number(movingNodeId),
        Number(newParentId)
      );
      await moveLevel(dto).unwrap();

      notification.success({
        message: "Level Moved",
        description: "The level has been moved successfully.",
      });

      // Clear cache and reload
      await LevelCache.clearSiteCache(siteId);
      await loadInitialData();
    } catch (error) {
      console.error("Error moving level:", error);
      notification.error({
        message: "Error Moving Level",
        description: "Failed to move the level. Please try again.",
      });
    } finally {
      setMovingNodeId(null);
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      if (drawerType === "create") {
        const newNode = new CreateNode(
          values.name?.trim(),
          values.description?.trim(),
          Number(values.responsibleId) || 0,
          Number(siteId),
          Number(values.superiorId) || 0,
          values.levelMachineId?.trim() || "",
          values.notify ? 1 : 0
        );
        await createLevel(newNode).unwrap();
        notification.success({ message: "Level created successfully" });
      } else if (drawerType === "update") {
        await updateLevel({
          ...values,
          id: Number(values.id),
          responsibleId: values.responsibleId ? Number(values.responsibleId) : null,
        }).unwrap();
        notification.success({ message: "Level updated successfully" });
      }

      // Clear cache and reload
      await LevelCache.clearSiteCache(siteId);
      await loadInitialData();

      setDrawerVisible(false);
      createForm.resetFields();
      updateForm.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
      notification.error({
        message: "Error",
        description: "Failed to save changes. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    await LevelCache.clearSiteCache(siteId);
    notification.success({
      message: "Cache Cleared",
      description: "The cache has been cleared. Refreshing data...",
    });
    await loadInitialData();
  };

  return (
    <MainContainer
      title={`${Strings.levelsOf} ${siteName}`}
      enableBackButton={isIhAdmin()}
      content={
        <div style={{ padding: '16px' }}>
          {/* Stats Banner */}
          {stats && (
            <Card style={{ marginBottom: '16px' }}>
              <Space size="large" wrap>
                <div>
                  <Text type="secondary">Total Levels</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {stats.totalLevels.toLocaleString()}
                  </Title>
                </div>
                <div>
                  <Text type="secondary">Active</Text>
                  <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                    {stats.activeLevels.toLocaleString()}
                  </Title>
                </div>
                <div>
                  <Text type="secondary">Max Depth</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {stats.maxDepth}
                  </Title>
                </div>
                {stats.performanceWarning && (
                  <Alert
                    message="Performance Mode"
                    description="Lazy loading enabled for optimal performance"
                    type="warning"
                    icon={<WarningOutlined />}
                    showIcon
                  />
                )}
              </Space>
            </Card>
          )}

          {/* Toolbar */}
          <Card style={{ marginBottom: '16px' }}>
            <Space wrap>
              <Button
                onClick={() => handleCreateLevel()}
                disabled={!selectedNode}
                type="primary"
              >
                Create Level
              </Button>
              <Button
                onClick={() => handleUpdateLevel()}
                disabled={!selectedNode || selectedNode.id === "0"}
              >
                Update Level
              </Button>
              <Button
                onClick={() => setMovingNodeId(selectedNode?.id || null)}
                disabled={!selectedNode || selectedNode.id === "0"}
              >
                Move Level
              </Button>
              {movingNodeId && (
                <Button
                  danger
                  onClick={() => setMovingNodeId(null)}
                >
                  Cancel Move
                </Button>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={loadInitialData}
                loading={isLoading}
              >
                Refresh
              </Button>
              <Button
                onClick={handleClearCache}
              >
                Clear Cache
              </Button>
            </Space>
          </Card>

          {/* Loading Progress */}
          {isLoading && loadingProgress > 0 && (
            <Card style={{ marginBottom: '16px' }}>
              <Progress percent={loadingProgress} status="active" />
              <Text>Loading level data...</Text>
            </Card>
          )}

          {/* Tree View */}
          <Card
            title="Level Hierarchy"
            extra={
              <Text type="secondary">
                Click to expand nodes • {expandedNodes.size} expanded
              </Text>
            }
            style={{ minHeight: '400px' }}
          >
            {isLoading && treeData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: '16px' }}>
                  Loading levels...
                </Paragraph>
              </div>
            ) : treeData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Paragraph>No levels found</Paragraph>
                <Button type="primary" onClick={() => handleCreateLevel()}>
                  Create First Level
                </Button>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {treeData.map(node => renderTreeNode(node))}
              </div>
            )}
          </Card>

          {/* Details Drawer */}
          {detailsVisible && selectedNode && (
            <Drawer
              title={`Level Details: ${selectedNode.name}`}
              placement="right"
              width={400}
              onClose={() => setDetailsVisible(false)}
              open={detailsVisible}
            >
              <LevelDetailsCard
                levelId={selectedNode.id}
                onClose={() => setDetailsVisible(false)}
                siteId={siteId}
              />
            </Drawer>
          )}

          {/* Form Drawer */}
          <LevelFormDrawer
            drawerVisible={drawerVisible}
            drawerType={drawerType}
            drawerPlacement="right"
            createForm={createForm}
            updateForm={updateForm}
            positionForm={Form.useForm()[0]}
            formData={selectedNode?.data || {}}
            isLoading={isLoading}
            handleDrawerClose={() => {
              setDrawerVisible(false);
              createForm.resetFields();
              updateForm.resetFields();
            }}
            handleSubmit={handleFormSubmit}
            selectedNodeName={selectedNode?.name || ""}
            positionData={null}
          />
        </div>
      }
    />
  );
};

export default LevelsPageOptimized;