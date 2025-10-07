import { useEffect, useState, useRef, useCallback } from "react";
import Tree from "react-d3-tree";
import Strings from "../../utils/localizations/Strings";
import LevelDetailsCard from "./components/LevelDetailsCard";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useCreateLevelMutation,
  useUdpateLevelMutation,
  useMoveLevelMutation,
  useGetLevelTreeLazyMutation,
  useGetChildrenLevelsMutation,
  useGetLevelStatsMutation,
} from "../../services/levelService";
import { useGetCardsByLevelMutation } from "../../services/cardService";
import { Level } from "../../data/level/level";
import { Form, Drawer, Spin, Modal, Button, App as AntApp } from "antd";
import { useAppDispatch } from "../../core/store";
import { setSiteId } from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import { CreateNode, MoveLevelDto } from "../../data/level/level.request";
import Constants from "../../utils/Constants";
import NodeElement from "./components/NodeElement";
import LevelMenuOptions from "./components/LevelMenuOptions";
import LevelFormDrawer from "./components/LevelFormDrawer";
import { useGetSiteMutation } from "../../services/siteService";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import AnatomyNotification, { AnatomyNotificationType } from "../components/AnatomyNotification";
import { LevelCache } from "../../utils/levelCache";

// Custom hook for lazy loading node data
const useLazyNode = () => {
  const [getChildrenLevels] = useGetChildrenLevelsMutation();
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  const loadChildren = useCallback(async (siteId: number, nodeId: string) => {
    if (loadingNodes.has(nodeId)) return null;

    const numericNodeId = parseInt(nodeId);
    if (isNaN(numericNodeId)) return [];

    setLoadingNodes(prev => {
      const newSet = new Set(prev);
      newSet.add(nodeId);
      return newSet;
    });

    try {
      // Check cache first
      const cached = await LevelCache.getCachedChildren(siteId, numericNodeId);
      if (cached) {
        setLoadingNodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(nodeId);
          return newSet;
        });
        return cached;
      }

      // Load from server
      const response = await getChildrenLevels({
        siteId: siteId.toString(),
        parentId: numericNodeId
      }).unwrap();

      // Cache the results
      if (response && response.length > 0) {
        for (const child of response) {
          await LevelCache.cacheLevel(siteId, child);
        }
      }

      setLoadingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });

      return response || [];
    } catch (error) {
      console.error("Error loading children:", error);
      setLoadingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
      return [];
    }
  }, [getChildrenLevels]);

  return { loadChildren, loadingNodes };
};

// Build hierarchy with placeholder children for lazy loading
const buildLazyHierarchy = (data: any[], loadedChildren: Map<string, any[]> = new Map()): any[] => {
  if (!data || !Array.isArray(data)) return [];

  return data.map(node => {
    if (!node || node.attributes?.isPlaceholder) return node;

    const nodeId = node.id?.toString();
    const dynamicallyLoaded = loadedChildren.get(nodeId);

    // Transform node
    const result = {
      ...node,
      id: nodeId,
      name: node.name || node.levelName || node.description || 'Level',
      attributes: {
        ...node.attributes,
        hasChildren: node.hasChildren || false,
        childrenCount: node.childrenCount || 0,
        isLoaded: false
      },
      children: []
    };

    // Handle children
    if (dynamicallyLoaded && dynamicallyLoaded.length > 0) {
      // Use dynamically loaded children
      result.children = buildLazyHierarchy(dynamicallyLoaded, loadedChildren);
      result.attributes.isLoaded = true;
    } else if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      // Use children from backend
      result.children = buildLazyHierarchy(node.children, loadedChildren);
      result.attributes.isLoaded = true;
    } else if (node.hasChildren) {
      // Add placeholder for lazy loading
      result.children = [{
        name: '...',
        id: `${nodeId}_placeholder`,
        attributes: {
          isPlaceholder: true,
          parentId: nodeId
        },
        children: []
      }];
    }

    return result;
  }).filter(Boolean);
};

const LevelsPageLazyTree = () => {
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [positionForm] = Form.useForm();
  const {isIhAdmin, rol} = useCurrentUser();

  // API mutations
  const [getLevelTreeLazy] = useGetLevelTreeLazyMutation();
  const [getLevelStats] = useGetLevelStatsMutation();
  const [createLevel] = useCreateLevelMutation();
  const [updateLevel] = useUdpateLevelMutation();
  const [moveLevel] = useMoveLevelMutation();
  const [getCardsByLevel] = useGetCardsByLevelMutation();
  const { notification: notificationApi } = AntApp.useApp();
  const [getSite] = useGetSiteMutation();

  // Lazy loading hook
  const { loadChildren, loadingNodes } = useLazyNode();

  // State
  const [isLoading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loadedChildren, setLoadedChildren] = useState<Map<string, any[]>>(new Map());
  const [levelCardCounts, setLevelCardCounts] = useState<{[key: string]: number}>({});
  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem('treeExpandedState');
    return storedState === 'true';
  });

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const [isCloning, setIsCloning] = useState(false);
  const [movingNodeId, setMovingNodeId] = useState<string | null>(null);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<"create" | "update" | "position" | null>(null);
  const [formData, setFormData] = useState<any>({});

  const [drawerPlacement, setDrawerPlacement] = useState<"right" | "bottom">("right");

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const siteName = location.state?.siteName || Strings.defaultSiteName;
  const siteId = location.state?.siteId;

  const [positionData, setPositionData] = useState<any>(null);
  const [, setSiteData] = useState<any>(null);

  // Handle node toggle with lazy loading
  const handleNodeToggle = useCallback(async (nodeDatum: any) => {
    if (!nodeDatum) return;

    const nodeId = nodeDatum?.id || nodeDatum?.data?.id;

    // If this is a placeholder, load children for its parent
    if (nodeDatum.attributes?.isPlaceholder && nodeDatum.attributes?.parentId) {
      const parentId = nodeDatum.attributes.parentId;

      if (loadingNodes.has(parentId)) return;

      try {
        const children = await loadChildren(siteId, parentId);

        if (children && children.length > 0) {
          // Update loaded children map
          setLoadedChildren(prev => {
            const newMap = new Map(prev);
            newMap.set(parentId, children);
            return newMap;
          });

          // Load card counts for new children
          const newCardCounts: {[key: string]: number} = {};
          for (const child of children) {
            try {
              const cards = await getCardsByLevel({
                levelId: child.id,
                siteId: siteId
              }).unwrap();
              newCardCounts[child.id] = cards.length;
            } catch (_error) {
              newCardCounts[child.id] = 0;
            }
          }

          setLevelCardCounts(prev => ({ ...prev, ...newCardCounts }));
        }
      } catch (_error) {
        console.error("Error loading children:", _error);
        notificationApi.error({
          message: "Error Loading Children",
          description: `Failed to load children for node ${parentId}`,
        });
      }
      return;
    }

    // Check if already loading
    if (loadingNodes.has(nodeId)) {
      return;
    }

    // Check if node has children to load
    if (nodeDatum.attributes?.hasChildren && !nodeDatum.attributes?.isLoaded) {
      try {
        // Store current collapsed state
        const isCollapsed = localStorage.getItem(
          `${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`
        ) === 'true';

        // Load children
        const children = await loadChildren(siteId, nodeId);

        if (children && children.length > 0) {
          // Update loaded children map
          setLoadedChildren(prev => {
            const newMap = new Map(prev);
            newMap.set(nodeId, children);
            return newMap;
          });

          // Load card counts for new children
          const newCardCounts: {[key: string]: number} = {};
          for (const child of children) {
            try {
              const cards = await getCardsByLevel({
                levelId: child.id,
                siteId: siteId
              }).unwrap();
              newCardCounts[child.id] = cards.length;
            } catch (_error) {
              newCardCounts[child.id] = 0;
            }
          }

          setLevelCardCounts(prev => ({ ...prev, ...newCardCounts }));

          // Restore collapsed state
          if (!isCollapsed) {
            localStorage.setItem(
              `${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`,
              'false'
            );
          }
        }
      } catch (error) {
        console.error("Error loading children:", error);
        notificationApi.error({
          message: "Error Loading Children",
          description: `Failed to load children for node ${nodeId}`,
        });
      }
    }
  }, [siteId, loadChildren, loadingNodes, getCardsByLevel]);

  // Initial data load - optimized version
  const handleGetLevels = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }

    setLoading(true);

    try {
      // Get stats first to understand data size
      const cachedStats = await LevelCache.getStats(siteId);
      let statsData = cachedStats;

      if (!cachedStats) {
        const statsResponse = await getLevelStats(siteId.toString()).unwrap();
        statsData = statsResponse;
        await LevelCache.cacheStats(siteId, statsData);
      }

      // Check cache for initial tree
      const cachedTree = await LevelCache.getTreeNode(siteId, null, 2);

      let initialData;
      if (cachedTree) {
        initialData = cachedTree;
      } else {
        // Load only first 2 levels initially
        const response = await getLevelTreeLazy({
          siteId: siteId.toString(),
          depth: 2
        }).unwrap();

        // Extract data array from response
        if (response && response.data && Array.isArray(response.data)) {
          initialData = response.data;
        } else {
          throw new Error("Invalid data format received from server");
        }

        await LevelCache.cacheTreeNode(siteId, null, 2, initialData);
      }

      // Ensure initialData is an array
      if (!Array.isArray(initialData)) {
        console.error("Initial data is not an array:", initialData);
        initialData = [];
      }

      // Build initial hierarchy (loadedChildren is empty initially)
      const hierarchyData = buildLazyHierarchy(initialData, new Map());

      // Apply initial expand state
      const isExpanded = localStorage.getItem('treeExpandedState') === 'true';
      if (isExpanded) {
        const applyExpandState = (nodes: any[]) => {
          nodes.forEach(node => {
            if (node.id !== "0") {
              localStorage.setItem(
                `${Constants.nodeStartBridgeCollapsed}${node.id}${Constants.nodeEndBridgeCollapserd}`,
                (!isExpanded).toString()
              );
            }
            if (node.children && node.children.length > 0 && !node.children[0]?.attributes?.isPlaceholder) {
              applyExpandState(node.children);
            }
          });
        };
        applyExpandState(hierarchyData);
      }

      // Load initial card counts (only for visible nodes)
      const cardCountsObj: {[key: string]: number} = {};
      const visibleNodes = initialData.slice(0, 50); // Limit initial card count loading

      for (const level of visibleNodes) {
        try {
          const cards = await getCardsByLevel({
            levelId: level.id,
            siteId: siteId
          }).unwrap();
          cardCountsObj[level.id] = cards.length;
        } catch (_error) {
          cardCountsObj[level.id] = 0;
        }
      }

      setLevelCardCounts(cardCountsObj);

      setTreeData([
        {
          name: Strings.levelsOf.concat(siteName),
          id: "0",
          attributes: {
            isRoot: true,
            originalData: initialData  // Store original data for rebuilding
          },
          children: hierarchyData,
        },
      ]);

      dispatch(setSiteId(siteId));

      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
      notificationApi.error({
        message: "Error Loading Levels",
        description: "Failed to load level data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update tree when children are loaded
  useEffect(() => {
    if (treeData.length > 0 && loadedChildren.size > 0) {
      // Get the original tree data (from initial load)
      const originalData = treeData[0].attributes?.originalData || [];

      // Rebuild hierarchy with loaded children
      const newHierarchy = buildLazyHierarchy(originalData, loadedChildren);

      setTreeData([{
        ...treeData[0],
        children: newHierarchy
      }]);
    }
  }, [loadedChildren]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenuVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenuVisible]);

  useEffect(() => {
    handleGetLevels();
  }, [location.state]);

  useEffect(() => {
    const updateDrawerPlacement = () => {
      if (window.innerWidth < 768) {
        setDrawerPlacement("bottom");
      } else {
        setDrawerPlacement("right");
      }
    };

    updateDrawerPlacement();
    window.addEventListener("resize", updateDrawerPlacement);
    return () => {
      window.removeEventListener("resize", updateDrawerPlacement);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('treeExpandedState', isTreeExpanded.toString());
  }, [isTreeExpanded]);

  const closeAllDrawers = () => {
    setDetailsVisible(false);
    setDrawerVisible(false);
  };

  const handleInitiateMove = () => {
    if (selectedNode?.data?.id) {
      setMovingNodeId(selectedNode.data.id);
      setContextMenuVisible(false);
      notificationApi.info({
        message: Strings.moveModeActiveMessage,
        description: Strings.moveModeActiveDescription,
        duration: 5,
      });
    }
  };

  const handleMoveNode = async (newParentId: string) => {
    if (!movingNodeId) return;

    if (movingNodeId === newParentId) {
      notificationApi.warning({ message: Strings.invalidMove, description: Strings.invalidMoveDescription });
      return;
    }

    try {
      setLoading(true);
      const dto = new MoveLevelDto(Number(movingNodeId), Number(newParentId));
      await moveLevel(dto).unwrap();
      notificationApi.success({ message: Strings.levelMovedMessage, description: Strings.levelMovedDescription });

      // Clear cache and reload
      await LevelCache.clearSiteCache(siteId);
      setLoadedChildren(new Map());
      await handleGetLevels();
    } catch (error) {
      console.error("Failed to move level:", error);
    } finally {
      setMovingNodeId(null);
      setLoading(false);
    }
  };

  const handleCreateLevel = () => {
    closeAllDrawers();
    const supId = selectedNode?.data?.id;
    if (supId === "0") {
      createForm.setFieldsValue({ superiorId: null });
    } else if (!supId) {
      return;
    } else {
      createForm.setFieldsValue({ superiorId: supId });
    }
    setDrawerType("create");
    setDrawerVisible(true);
    setContextMenuVisible(false);
  };

  const handleUpdateLevel = () => {
    closeAllDrawers();
    setDrawerType("update");
    updateForm.resetFields();
    if (selectedNode?.data) {
      updateForm.setFieldsValue(selectedNode.data);
    }
    setFormData(selectedNode?.data || {});
    setDrawerVisible(true);
    setContextMenuVisible(false);
  };

  const handleCreatePosition = async () => {
    closeAllDrawers();
    if (!selectedNode?.data?.id) {
      return;
    }

    const level = selectedNode.data;

    try {
      const siteResponse = await getSite(location.state.siteId).unwrap();
      setSiteData(siteResponse);

      const newPositionData = {
        siteId: Number(location.state.siteId),
        siteName: location.state.siteName,
        siteType: siteResponse.siteType,
        areaId: 2,
        areaName: "Development",
        levelId: Number(level.id),
        levelName: level.name,
        route: level.levelLocation,
      };

      setPositionData(newPositionData);

      positionForm.resetFields();
      setDrawerType("position");
      setDrawerVisible(true);
      setContextMenuVisible(false);
    } catch (error) {
      console.error("Error fetching site data:", error);
      throw error;
    }
  };

  const cloneSubtree = async (
    node: any,
    newSuperiorId: number | null = null,
    isRoot: boolean = false
  ): Promise<Level> => {
    const allowedProperties = [
      Constants.responsibleId,
      Constants.siteId,
      Constants.superiorId,
      Constants.name,
      Constants.description,
      Constants.notify,
    ];
    const payload = allowedProperties.reduce((acc: any, key: string) => {
      if (node[key] !== undefined) {
        if (
          [
            Constants.responsibleId,
            Constants.siteId,
            Constants.superiorId,
            Constants.notify,
          ].includes(key)
        ) {
          acc[key] = node[key] !== null ? Number(node[key]) : node[key];
        } else {
          acc[key] = node[key];
        }
      }
      return acc;
    }, {});
    if (!payload.siteId && location.state?.siteId) {
      payload.siteId = Number(location.state.siteId);
    }
    payload.superiorId =
      newSuperiorId !== null
        ? newSuperiorId
        : payload.superiorId !== undefined
        ? Number(payload.superiorId)
        : 0;

    payload.levelMachineId = null;

    payload.name = isRoot ? `${node.name} ${Strings.copy}` : node.name;
    const newNodeData = await createLevel(payload).unwrap();
    AnatomyNotification.success(notificationApi, AnatomyNotificationType._REGISTER);
    const parentId = Number(newNodeData.id);
    if (isNaN(parentId)) {
      AnatomyNotification.error(notificationApi, Strings.errorGettingLevelId);
      throw new Error(Strings.errorGettingLevelId);
    }

    // For lazy loading, we don't clone all children immediately
    // Only clone if children are already loaded
    if (node.children && node.children.length > 0 && !node.children[0]?.attributes?.isPlaceholder) {
      for (const child of node.children) {
        await cloneSubtree(child, parentId, false);
      }
    }

    return newNodeData;
  };

  const handleCloneLevel = async () => {
    if (!selectedNode?.data) return;

    Modal.confirm({
      title: Strings.confirmCloneLevel,
      content: `${Strings.confirmCloneLevelMessage}` + Strings.levelSubLebelsWarning,
      okText: Strings.yes,
      cancelText: Strings.no,
      onOk: async () => {
        try {
          setIsCloning(true);
          await cloneSubtree(selectedNode.data, null, true);

          // Clear cache and reload
          await LevelCache.clearSiteCache(siteId);
          setLoadedChildren(new Map());
          await handleGetLevels();
        } catch (error) {
          console.error("Error cloning level:", error);
          throw error;
        } finally {
          setIsCloning(false);
          setContextMenuVisible(false);
        }
      },
      onCancel: () => {
        setContextMenuVisible(false);
      },
    });
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedLevelId(null);
  };

  const handleDrawerClose = () => {
    createForm.resetFields();
    updateForm.resetFields();
    positionForm.resetFields();
    setDrawerVisible(false);
    setDrawerType(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (drawerType === "create") {
        const supIdNum = Number(values.superiorId);
        const newNode = new CreateNode(
          values.name?.trim(),
          values.description?.trim(),
          Number(values.responsibleId) || 0,
          Number(location.state.siteId),
          supIdNum,
          values.levelMachineId?.trim() || Strings.empty,
          values.notify ? 1 : 0
        );
        await createLevel(newNode).unwrap();
        AnatomyNotification.success(notificationApi, AnatomyNotificationType._REGISTER);

        // Clear parent's cache if exists
        if (supIdNum) {
          const parentCached = loadedChildren.get(supIdNum.toString());
          if (parentCached) {
            setLoadedChildren(prev => {
              const newMap = new Map(prev);
              newMap.delete(supIdNum.toString());
              return newMap;
            });
          }
        }
      } else if (drawerType === "update") {
        const { ...updateValues } = values;
        const updatePayload = {
          ...updateValues,
          id: Number(values.id),
          responsibleId: values.responsibleId ? Number(values.responsibleId) : null,
        };
        await updateLevel(updatePayload).unwrap();
        AnatomyNotification.success(notificationApi, AnatomyNotificationType._UPDATE);
      }

      // Clear cache and reload
      await LevelCache.clearSiteCache(siteId);
      setLoadedChildren(new Map());
      await handleGetLevels();
      handleDrawerClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (nodeId: string) => {
    // Don't show details for placeholders or root node
    if (nodeId !== "0" && !nodeId.includes("_placeholder")) {
      closeAllDrawers();
      setSelectedLevelId(nodeId);
      setDetailsVisible(true);
      setContextMenuVisible(false);
    }
  };

  const expandAllNodes = () => {
    const expandNodes = (nodes: any[]) => {
      nodes.forEach(node => {
        localStorage.setItem(
          `${Constants.nodeStartBridgeCollapsed}${node.id}${Constants.nodeEndBridgeCollapserd}`,
          "false"
        );

        if (node.children && node.children.length > 0) {
          expandNodes(node.children);
        }
      });
    };

    if (treeData.length > 0) {
      expandNodes(treeData);
      localStorage.setItem('treeExpandedState', 'true');
      handleGetLevels();
      setIsTreeExpanded(true);
    }
  };

  const collapseAllNodes = () => {
    const collapseNodes = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.id !== "0") {
          localStorage.setItem(
            `${Constants.nodeStartBridgeCollapsed}${node.id}${Constants.nodeEndBridgeCollapserd}`,
            "true"
          );
        }

        if (node.children && node.children.length > 0) {
          collapseNodes(node.children);
        }
      });
    };

    if (treeData.length > 0) {
      collapseNodes(treeData);
      localStorage.setItem('treeExpandedState', 'false');
      handleGetLevels();
      setIsTreeExpanded(false);
    }
  };

  const toggleAllNodes = () => {
    if (isTreeExpanded) {
      collapseAllNodes();
    } else {
      expandAllNodes();
    }
  };

  const isRootNode = selectedNode?.data?.id === "0";

  return (
    <MainContainer
      title=""
      enableBackButton={isIhAdmin()}
      content={
        <div>
          <div
            ref={containerRef}
            className="flex-grow border border-gray-300 shadow-md rounded-md m-4 p-4 relative overflow-hidden"
            style={{ height: "calc(100vh - 6rem)" }}
            onPointerDown={(e) => {
              if (e.target === containerRef.current) {
                setContextMenuVisible(false);
                if (movingNodeId) {
                  setMovingNodeId(null);
                  notificationApi.info({
                    message: "Move Canceled",
                    description: "The move operation has been canceled.",
                  });
                }
              }
            }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Expand all nodes */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    type={isTreeExpanded ? "default" : "primary"}
                    onClick={toggleAllNodes}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isTreeExpanded ? Strings.collapseAll : Strings.expandAll}
                  </Button>
                </div>

                {treeData.length > 0 && (
                  <Tree
                    data={treeData}
                    orientation="horizontal"
                    translate={translate}
                    nodeSize={{ x: 200, y: 80 }}
                    separation={{ siblings: 1, nonSiblings: 1.2 }}
                    renderCustomNodeElement={(rd3tProps) => (
                      <NodeElement
                        nodeDatum={rd3tProps.nodeDatum}
                        toggleNode={async () => {
                          // Don't toggle placeholders
                          if (!rd3tProps.nodeDatum.attributes?.isPlaceholder) {
                            // First toggle the node in the tree
                            rd3tProps.toggleNode();
                          }
                          // Then load children if needed
                          await handleNodeToggle(rd3tProps.nodeDatum);
                        }}
                        containerRef={containerRef}
                        setContextMenuVisible={setContextMenuVisible}
                        setContextMenuPos={setContextMenuPos}
                        setSelectedNode={setSelectedNode}
                        handleShowDetails={handleShowDetails}
                        cardCounts={levelCardCounts}
                        movingNodeId={movingNodeId}
                        onMoveNode={handleMoveNode}
                        isLoading={
                          !!(loadingNodes.has((rd3tProps.nodeDatum as any).id) ||
                          (rd3tProps.nodeDatum.attributes?.isPlaceholder &&
                           loadingNodes.has((rd3tProps.nodeDatum as any).id.replace('_placeholder', ''))))
                        }
                      />
                    )}
                    collapsible={true}
                    onNodeClick={(node) => {
                      // Handle node click for lazy loading
                      // Pass the full nodeDatum, not just data which might be undefined
                      handleNodeToggle(node);
                    }}
                  />
                )}
                {isCloning && (
                  <div className="absolute inset-0 flex justify-center items-center bg-black/50 z-50">
                    <Spin size="large" tip={Strings.cloningLevelsMessage} />
                  </div>
                )}
              </>
            )}
          </div>

          <LevelMenuOptions
            isVisible={contextMenuVisible}
            role={rol}
            isRootNode={isRootNode}
            contextMenuPos={contextMenuPos}
            handleCreateLevel={handleCreateLevel}
            handleUpdateLevel={handleUpdateLevel}
            handleCloneLevel={handleCloneLevel}
            handleCreatePosition={handleCreatePosition}
            handleInitiateMove={handleInitiateMove}
          />

          {detailsVisible && selectedLevelId && (
            <Drawer
              mask={false}
              maskClosable={false}
              title={Strings.levelDetailsTitle.concat(
                selectedNode?.data?.name ? `: ${selectedNode.data.name}` : ""
              )}
              placement={drawerPlacement}
              height={drawerPlacement === "bottom" ? "50vh" : undefined}
              width={drawerPlacement === "right" ? 400 : undefined}
              onClose={handleCloseDetails}
              open={detailsVisible}
              destroyOnHidden
              closable={true}
              className="drawer-responsive"
            >
              <LevelDetailsCard
                levelId={selectedLevelId}
                onClose={handleCloseDetails}
                siteId={siteId}
              />
            </Drawer>
          )}

          <LevelFormDrawer
            drawerVisible={drawerVisible}
            drawerType={drawerType}
            drawerPlacement={drawerPlacement}
            createForm={createForm}
            updateForm={updateForm}
            positionForm={positionForm}
            formData={formData}
            isLoading={isLoading}
            handleDrawerClose={handleDrawerClose}
            handleSubmit={handleSubmit}
            selectedNodeName={selectedNode?.data?.name || ""}
            positionData={positionData}
          />
        </div>
      }
    />
  );
};

export default LevelsPageLazyTree;