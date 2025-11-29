import { useEffect, useState, useRef, useCallback } from "react";
import Tree from "react-d3-tree";
import Strings from "../../utils/localizations/Strings";
import LevelDetailsCard from "../level/components/LevelDetailsCard";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetLevelTreeLazyMutation,
  useGetChildrenLevelsMutation,
  useGetLevelStatsMutation
} from "../../services/levelService";
import { useGetCardsByLevelMutation } from "../../services/cardService";

import { Level } from "../../data/level/level";
import { Drawer, Spin, Button, notification, Progress } from "antd";
import { useAppDispatch } from "../../core/store";
import { setSiteId } from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import Constants from "../../utils/Constants";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import RefreshButton from "../components/RefreshButton";
import { theme } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { LevelCache } from "../../utils/levelCache";
import { showNetworkError } from "../../utils/networkErrorHandler";

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
      if (cached && cached.length > 0) {
        return cached;
      }

      const response = await getChildrenLevels({
        siteId: siteId.toString(),
        parentId: numericNodeId
      }).unwrap();

      const children = response || [];

      // Cache the children
      if (children.length > 0) {
        for (const child of children) {
          await LevelCache.cacheLevel(siteId, child);
        }
      }

      return children;
    } catch (error) {
      console.error(`Error loading children for node ${nodeId}:`, error);
      return [];
    } finally {
      setLoadingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
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

// Read-only Node Component with loading state
const ReadOnlyNodeElement = ({
  nodeDatum,
  toggleNode,
  handleShowDetails,
  cardCounts = {},
  assignmentCounts = {},
  isLoading = false
}: any) => {
  const { token } = theme.useToken();

  const getCollapsedState = (nodeId: string): boolean => {
    const storedState = localStorage.getItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`
    );
    return storedState === "true";
  };

  const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
    localStorage.setItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`,
      isCollapsed.toString()
    );
  };

  const isCollapsed = getCollapsedState(nodeDatum.id);
  nodeDatum.__rd3t.collapsed = isCollapsed;

  const isLeafNode = !nodeDatum.children || nodeDatum.children.length === 0;

  // Check if this is a placeholder node
  const isPlaceholder = nodeDatum.attributes?.isPlaceholder;

  // Helper functions for assignments (similar to cards)
  const hasAssignments = (node: any, assignmentCounts: { [key: string]: number }) => {
    if (node.id !== "0" && assignmentCounts[node.id] && assignmentCounts[node.id] > 0) {
      return true;
    }

    if (node.children && node.children.length > 0) {
      return node.children.some((child: any) => hasAssignments(child, assignmentCounts));
    }

    return false;
  };

  const _calculateTotalAssignments = (node: any, assignmentCounts: { [key: string]: number }): number => {
    const ownAssignments = node.id !== "0" && assignmentCounts[node.id] ? assignmentCounts[node.id] : 0;

    if (!node.children || node.children.length === 0) {
      return ownAssignments;
    }

    const childrenAssignments = node.children.reduce(
      (total: number, child: any) => total + _calculateTotalAssignments(child, assignmentCounts),
      0
    );

    return ownAssignments + childrenAssignments;
  };

  const calculateTotalCards = (node: any, cardCounts: { [key: string]: number }): number => {
    const ownCards = node.id !== "0" && cardCounts[node.id] ? cardCounts[node.id] : 0;

    if (!node.children || node.children.length === 0) {
      return ownCards;
    }

    const childrenCards = node.children.reduce(
      (total: number, child: any) => total + calculateTotalCards(child, cardCounts),
      0
    );

    return ownCards + childrenCards;
  };

  // Get counts
  const assignmentCount = nodeDatum.id !== "0" ? assignmentCounts[nodeDatum.id] : null;
  const totalCardCount = nodeDatum.id !== "0" ? calculateTotalCards(nodeDatum, cardCounts) : null;

  // Check if node or children have assignments
  const nodeHasOwnAssignments = assignmentCount && assignmentCount > 0;
  const nodeChildrenHaveAssignments =
    nodeDatum.children &&
    nodeDatum.children.length > 0 &&
    nodeDatum.children.some((child: any) => hasAssignments(child, assignmentCounts));

  // Show split colors if node has assignments (own or children)
  const showSplitColors = nodeDatum.id !== "0" && (nodeHasOwnAssignments || nodeChildrenHaveAssignments);

  // Default fill color - placeholders should be gray
  const fillColor = isPlaceholder ? "#f0f0f0" : (isLeafNode ? "#FFFF00" : "#145695");

  // Display text with only card count (matching LevelsPage format)
  const displayText = nodeDatum.name +
    (totalCardCount && totalCardCount > 0 ? ` (${totalCardCount})` : "");

  const handleLeftClick = (e: React.MouseEvent<SVGGElement>) => {
    e.stopPropagation();

    // Only show details for non-root and non-placeholder nodes
    if (nodeDatum.id !== "0" && !nodeDatum.attributes?.isPlaceholder) {
      handleShowDetails(nodeDatum.id);
    }

    // Handle node expansion/collapse
    const newCollapsedState = !nodeDatum.__rd3t.collapsed;
    setCollapsedState(nodeDatum.id, newCollapsedState);
    toggleNode();
  };

  return (
    <g onClick={handleLeftClick} style={{
      cursor: isLoading ? 'progress' : isPlaceholder ? 'pointer' : 'pointer',
      opacity: isLoading ? 0.7 : 1
    }}>
      {/* Loading indicator */}
      {isLoading ? (
        <>
          <circle r={15} fill="#f0f0f0" stroke="#d9d9d9" strokeWidth={1} />
          <foreignObject x={-10} y={-10} width={20} height={20}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}>
              <LoadingOutlined style={{ fontSize: '12px', color: '#1890ff' }} spin />
            </div>
          </foreignObject>
        </>
      ) : isPlaceholder ? (
        // Placeholder node
        <circle r={8} fill="#f0f0f0" stroke="#d9d9d9" strokeWidth={0.5} />
      ) : showSplitColors ? (
        <>
          {/* Base circle in yellow (represents cards or leaf nodes) */}
          <circle r={15} fill="#FFFF00" stroke="none" />
          {/* Top half in blue (represents CILT/OPL assignments) */}
          <path
            d="M -15,0 A 15,15 0 0,1 15,0 L -15,0 Z"
            fill="#145695"
            stroke="none"
          />
        </>
      ) : (
        <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
      )}
      <text
        fill={isLoading ? "#999999" : token.colorText}
        strokeWidth={nodeDatum.id === "0" ? "0.8" : "0"}
        x={nodeDatum.id === "0" ? -200 : 20}
        y={nodeDatum.id === "0" ? 0 : 20}
        style={{ fontSize: "14px" }}
      >
        {isLoading ? `${displayText} ...` : displayText}
      </text>
    </g>
  );
};

const LevelsReadOnlyLazy = () => {
  const { isIhAdmin } = useCurrentUser();
  const [getLevelTreeLazy] = useGetLevelTreeLazyMutation();
  const [getCardsByLevel] = useGetCardsByLevelMutation();
  const [getLevelStats] = useGetLevelStatsMutation();
  const { loadChildren, loadingNodes } = useLazyNode();
  const [notificationApi, contextHolder] = notification.useNotification();

  const [isLoading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [levelCardCounts, setLevelCardCounts] = useState<{ [key: string]: number }>({});
  const [assignmentCounts, setAssignmentCounts] = useState<{ [key: string]: number }>({});
  const [loadedChildren, setLoadedChildren] = useState<Map<string, Level[]>>(new Map());
  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem("treeExpandedStateReadOnly");
    return storedState === "true";
  });

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [drawerPlacement, setDrawerPlacement] = useState<"right" | "bottom">("right");
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const siteName = location.state?.siteName || Strings.defaultSiteName;
  const siteId = location.state?.siteId;

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
    localStorage.setItem("treeExpandedStateReadOnly", isTreeExpanded.toString());
  }, [isTreeExpanded]);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const user = sessionStorage.getItem(Constants.SESSION_KEYS.user);
    const token = user ? JSON.parse(user).token : '';
    return {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleGetLevels = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }

    setLoading(true);
    setLoadingProgress(10);

    try {
      // Get stats first to check total levels
      const stats = await getLevelStats({ siteId: siteId.toString() }).unwrap();

      // Cache the stats
      await LevelCache.cacheStats(parseInt(siteId), stats);
      setLoadingProgress(30);

      // Get initial tree with lazy loading (depth of 2)
      const response = await getLevelTreeLazy({
        siteId: siteId.toString(),
        depth: 2
      }).unwrap();

      // Extract data array from response
      let initialData = [];
      if (response && response.data && Array.isArray(response.data)) {
        initialData = response.data;
      } else if (Array.isArray(response)) {
        initialData = response;
      } else {
        throw new Error("Invalid data format received from server");
      }

      const activeNodes = initialData.filter((node: any) => !node.deletedAt);

      // Cache initial nodes
      await LevelCache.cacheTreeNode(parseInt(siteId), null, 2, activeNodes);
      setLoadingProgress(50);

      const hierarchyData = buildLazyHierarchy(activeNodes, new Map());

      const isExpanded = localStorage.getItem("treeExpandedStateReadOnly") === "true";

      if (isExpanded !== undefined) {
        const applyExpandState = (nodes: any[]) => {
          nodes.forEach((node) => {
            if (node.id !== "0" && !node.attributes?.isPlaceholder) {
              localStorage.setItem(
                `${Constants.nodeStartBridgeCollapsed}${node.id}${Constants.nodeEndBridgeCollapserd}`,
                (!isExpanded).toString()
              );
            }

            if (node.children && node.children.length > 0) {
              applyExpandState(node.children);
            }
          });
        };

        applyExpandState(hierarchyData);
      }

      // Fetch card counts and assignment counts for each level
      const cardCountsObj: {[key: string]: number} = {};
      const assignmentCountsObj: {[key: string]: number} = {};

      // Create an array of promises for fetching card counts
      const countPromises = activeNodes.map(async (level) => {
        try {
          const cards = await getCardsByLevel({
            levelId: level.id,
            siteId: location.state.siteId
          }).unwrap();

          cardCountsObj[level.id] = cards.length;
        } catch (_error) {
          console.error(`Error fetching cards for level ${level.id}:`, _error);
          cardCountsObj[level.id] = 0;
        }
      });

      // Create promises for fetching assignment counts
      const assignmentPromises = activeNodes.map(async (level) => {
        try {
          // Fetch CILT assignments for this level

          const ciltAssignmentsResponse = await fetch(
            `${import.meta.env.VITE_API_SERVICE}/cilt-mstr-position-levels/level/${level.id}?skipOpl=true`,
            {
              method: 'GET',
              headers: getAuthHeaders()
            }
          );

          let ciltCount = 0;
          if (ciltAssignmentsResponse.ok) {
            const ciltData = await ciltAssignmentsResponse.json();
            const ciltAssignments = ciltData.data || ciltData;
            ciltCount = Array.isArray(ciltAssignments) ? ciltAssignments.filter(a => a.status === 'A').length : 0;
          }

          // Fetch OPL assignments for this level
          const oplAssignmentsResponse = await fetch(
            `${import.meta.env.VITE_API_SERVICE}/opl-levels/level/${level.id}`,
            {
              method: 'GET',
              headers: getAuthHeaders()
            }
          );

          let oplCount = 0;
          if (oplAssignmentsResponse.ok) {
            const oplData = await oplAssignmentsResponse.json();
            const oplAssignments = oplData.data || oplData;
            oplCount = Array.isArray(oplAssignments) ? oplAssignments.length : 0;
          }

          // Total assignments for this level
          assignmentCountsObj[level.id] = ciltCount + oplCount;
        } catch (_error) {
          console.error(`Error fetching assignments for level ${level.id}:`, _error);
          assignmentCountsObj[level.id] = 0;
        }
      });

      // Wait for all card count and assignment requests to complete
      await Promise.all([...countPromises, ...assignmentPromises]);
      setLoadingProgress(90);

      // Update state with counts
      setLevelCardCounts(cardCountsObj);
      setAssignmentCounts(assignmentCountsObj);
      setLoadingProgress(100);

      setTreeData([
        {
          name: Strings.levelsOf.concat(siteName),
          id: "0",
          attributes: {
            isRoot: true,
            originalData: activeNodes  // Store original data for rebuilding
          },
          children: hierarchyData,
        },
      ]);
      dispatch(setSiteId(location.state.siteId));
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      console.error("[LevelReadOnlyLazy] Error loading levels:", error);
      showNetworkError(notificationApi, error);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  // Handle node toggle for lazy loading
  const handleNodeToggle = useCallback(async (nodeDatum: any) => {
    const nodeId = nodeDatum.data?.id || nodeDatum.id;

    // If this is a placeholder, we need to load children for its parent
    if (nodeDatum.attributes?.isPlaceholder) {
      // Extract parent ID from placeholder ID (e.g., "1_placeholder" -> "1")
      const parentId = nodeId.replace('_placeholder', '');

      // Check if already loading this parent's children
      if (loadingNodes.has(parentId)) {
        return;
      }

      try {
        // Load children for the parent
        const children = await loadChildren(parseInt(siteId), parentId);

        if (children && children.length > 0) {
          // Update loaded children map
          setLoadedChildren(prev => {
            const newMap = new Map(prev);
            newMap.set(parentId, children);
            return newMap;
          });

          // Fetch card counts for new children
          const newCardCounts: {[key: string]: number} = {};
          const newAssignmentCounts: {[key: string]: number} = {};

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

            // Fetch assignments for new children
            try {
              let ciltCount = 0;
              let oplCount = 0;

              const ciltResponse = await fetch(
                `${import.meta.env.VITE_API_SERVICE}/cilt-mstr-position-levels/level/${child.id}?skipOpl=true`,
                {
                  method: 'GET',
                  headers: getAuthHeaders()
                }
              );

              if (ciltResponse.ok) {
                const ciltData = await ciltResponse.json();
                const ciltAssignments = ciltData.data || ciltData;
                ciltCount = Array.isArray(ciltAssignments) ? ciltAssignments.filter(a => a.status === 'A').length : 0;
              }

              const oplResponse = await fetch(
                `${import.meta.env.VITE_API_SERVICE}/opl-levels/level/${child.id}`,
                {
                  method: 'GET',
                  headers: getAuthHeaders()
                }
              );

              if (oplResponse.ok) {
                const oplData = await oplResponse.json();
                const oplAssignments = oplData.data || oplData;
                oplCount = Array.isArray(oplAssignments) ? oplAssignments.length : 0;
              }

              newAssignmentCounts[child.id] = ciltCount + oplCount;
            } catch (_error) {
              newAssignmentCounts[child.id] = 0;
            }
          }

          setLevelCardCounts(prev => ({ ...prev, ...newCardCounts }));
          setAssignmentCounts(prev => ({ ...prev, ...newAssignmentCounts }));
        }
      } catch (error) {
        console.error("[LevelReadOnlyLazy] Error loading children:", error);
        showNetworkError(notificationApi, error, `${Strings.error} loading children for node ${parentId}`);
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
        const children = await loadChildren(parseInt(siteId), nodeId);

        if (children && children.length > 0) {
          setLoadedChildren(prev => {
            const newMap = new Map(prev);
            newMap.set(nodeId, children);
            return newMap;
          });

          // Fetch card counts and assignments for new children
          const newCardCounts: {[key: string]: number} = {};
          const newAssignmentCounts: {[key: string]: number} = {};

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

            // Fetch assignments
            try {
              let ciltCount = 0;
              let oplCount = 0;

              const ciltResponse = await fetch(
                `${import.meta.env.VITE_API_SERVICE}/cilt-mstr-position-levels/level/${child.id}?skipOpl=true`,
                {
                  method: 'GET',
                  headers: getAuthHeaders()
                }
              );

              if (ciltResponse.ok) {
                const ciltData = await ciltResponse.json();
                const ciltAssignments = ciltData.data || ciltData;
                ciltCount = Array.isArray(ciltAssignments) ? ciltAssignments.filter(a => a.status === 'A').length : 0;
              }

              const oplResponse = await fetch(
                `${import.meta.env.VITE_API_SERVICE}/opl-levels/level/${child.id}`,
                {
                  method: 'GET',
                  headers: getAuthHeaders()
                }
              );

              if (oplResponse.ok) {
                const oplData = await oplResponse.json();
                const oplAssignments = oplData.data || oplData;
                oplCount = Array.isArray(oplAssignments) ? oplAssignments.length : 0;
              }

              newAssignmentCounts[child.id] = ciltCount + oplCount;
            } catch (_error) {
              newAssignmentCounts[child.id] = 0;
            }
          }

          setLevelCardCounts(prev => ({ ...prev, ...newCardCounts }));
          setAssignmentCounts(prev => ({ ...prev, ...newAssignmentCounts }));
        }
      } catch (error) {
        console.error("[LevelReadOnlyLazy] Error loading node children:", error);
        showNetworkError(notificationApi, error);
      }
    }
  }, [loadChildren, loadingNodes, siteId, getCardsByLevel, notificationApi]);

  // Update tree data when loaded children changes
  useEffect(() => {
    if (treeData.length > 0 && loadedChildren.size > 0) {
      // Get the original tree data (from initial load)
      const originalData = treeData[0].attributes?.originalData || [];

      // Merge original data with loaded children to build complete hierarchy
      const mergeLoadedData = (nodes: any[]): any[] => {
        return nodes.map(node => {
          const nodeId = node.id?.toString();
          const loadedChildrenForNode = loadedChildren.get(nodeId);

          if (loadedChildrenForNode && loadedChildrenForNode.length > 0) {
            // Recursively merge children
            return {
              ...node,
              children: mergeLoadedData(loadedChildrenForNode)
            };
          }

          // Keep original children if no loaded children
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: mergeLoadedData(node.children)
            };
          }

          return node;
        });
      };

      const mergedData = mergeLoadedData(originalData);

      // Rebuild hierarchy with all loaded children
      const newHierarchy = buildLazyHierarchy(mergedData, loadedChildren);

      setTreeData([{
        ...treeData[0],
        attributes: {
          ...treeData[0].attributes,
          originalData: mergedData  // Update original data with merged data
        },
        children: newHierarchy
      }]);
    }
  }, [loadedChildren]);

  const handleShowDetails = (nodeId: string) => {
    if (nodeId !== "0" && !nodeId.includes("_placeholder")) {
      setSelectedLevelId(nodeId);
      setDetailsVisible(true);
    }
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedLevelId(null);
  };

  const expandAllNodes = () => {
    notificationApi.warning({
      message: "Performance Warning",
      description: "Expand All is disabled in lazy-loading mode to maintain performance. Please expand nodes individually.",
    });
  };

  const collapseAllNodes = () => {
    const collapseNodes = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.id !== "0" && !node.attributes?.isPlaceholder) {
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
      localStorage.setItem("treeExpandedStateReadOnly", "false");
      setIsTreeExpanded(false);
      // Force re-render to show collapsed state
      setTreeData([...treeData]);
    }
  };

  const toggleAllNodes = () => {
    if (isTreeExpanded) {
      collapseAllNodes();
    } else {
      expandAllNodes();
    }
  };

  return (
    <MainContainer
      title={`${Strings.levelsOf} ${siteName} (${Strings.readOnly})`}
      enableBackButton={isIhAdmin()}
      content={
        <div>
          {contextHolder}
          <div
            ref={containerRef}
            className="flex-grow border border-gray-300 shadow-md rounded-md m-4 p-4 relative overflow-hidden"
            style={{ height: "calc(100vh - 6rem)" }}
          >
            {/* Loading Progress */}
            {loadingProgress > 0 && loadingProgress < 100 && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                backgroundColor: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Progress
                  percent={loadingProgress}
                  status="active"
                  style={{ minWidth: 200 }}
                />
              </div>
            )}

            {isLoading && loadingProgress === 0 ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Expand all nodes */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <RefreshButton onRefresh={handleGetLevels} isLoading={isLoading} />
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
                      <ReadOnlyNodeElement
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
                        handleShowDetails={handleShowDetails}
                        cardCounts={levelCardCounts}
                        assignmentCounts={assignmentCounts}
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
                      handleNodeToggle(node);
                    }}
                  />
                )}
              </>
            )}
          </div>

          {detailsVisible && selectedLevelId && (
            <Drawer
              mask={false}
              maskClosable={false}
              title={Strings.levelDetailsTitle}
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
        </div>
      }
    />
  );
};

export default LevelsReadOnlyLazy;