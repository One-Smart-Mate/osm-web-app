import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button, Spin, theme, App as AntApp, Progress } from "antd";
import Tree from "react-d3-tree";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import Constants from "../../utils/Constants";
import CiltLevelMenuOptions from "./components/CiltLevelMenuOptions";
import CiltAssignmentDrawer from "./components/CiltAssignmentDrawer";
import LevelDetailsDrawer from "./components/LevelDetailsDrawer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import {
  useGetLevelTreeLazyMutation,
  useGetChildrenLevelsMutation,
  useGetLevelStatsMutation
} from "../../services/levelService";
import { Level } from "../../data/level/level";
import AnatomyNotification from "../components/AnatomyNotification";
import { LoadingOutlined } from "@ant-design/icons";

import { useCreateCiltMstrPositionLevelMutation } from "../../services/cilt/assignaments/ciltMstrPositionsLevelsService";
import { useCreateOplLevelMutation } from "../../services/cilt/assignaments/oplLevelService";
import OplAssignmentDrawer from "./components/OplAssignmentDrawer";
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
      if (cached && cached.length > 0) {
        return cached;
      }

      const response = await getChildrenLevels({
        siteId: siteId,
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

// Custom Node Component with loading state
const CustomNode = ({
  nodeDatum,
  toggleNode,
  onNodeContextMenu,
  assignmentCounts = {},
  isLoading = false
}: any) => {
  const { token } = theme.useToken();

  const isCollapsed =
    localStorage.getItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeDatum.id}${Constants.nodeEndBridgeCollapserd}`
    ) === "true";

  nodeDatum.__rd3t = nodeDatum.__rd3t || {};
  nodeDatum.__rd3t.collapsed = isCollapsed;

  const isLeafNode = !nodeDatum.children || nodeDatum.children.length === 0;

  // Check if this is a placeholder node
  const isPlaceholder = nodeDatum.attributes?.isPlaceholder;

  // Helper functions for assignments
  const hasAssignments = (node: any, assignmentCounts: { [key: string]: number }) => {
    if (node.id !== "0" && assignmentCounts[node.id] && assignmentCounts[node.id] > 0) {
      return true;
    }

    if (node.children && node.children.length > 0) {
      return node.children.some((child: any) => hasAssignments(child, assignmentCounts));
    }

    return false;
  };

  const calculateTotalAssignments = (node: any, assignmentCounts: { [key: string]: number }): number => {
    const ownAssignments = node.id !== "0" && assignmentCounts[node.id] ? assignmentCounts[node.id] : 0;

    if (!node.children || node.children.length === 0) {
      return ownAssignments;
    }

    const childrenAssignments = node.children.reduce(
      (total: number, child: any) => total + calculateTotalAssignments(child, assignmentCounts),
      0
    );

    return ownAssignments + childrenAssignments;
  };

  // Get assignment counts
  const assignmentCount = nodeDatum.id !== "0" ? assignmentCounts[nodeDatum.id] : null;
  const totalAssignmentCount = nodeDatum.id !== "0" ? calculateTotalAssignments(nodeDatum, assignmentCounts) : null;

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

  // Display text with assignment count
  let displayText = nodeDatum.name;
  if (totalAssignmentCount && totalAssignmentCount > 0) {
    displayText += ` (${totalAssignmentCount})`;
  }

  const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
    localStorage.setItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`,
      isCollapsed.toString()
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle collapsed state in localStorage first
    const newCollapsedState = !nodeDatum.__rd3t.collapsed;
    setCollapsedState(nodeDatum.id, newCollapsedState);
    // Then update the visual state
    toggleNode();
  };

  return (
    <g
      onClick={handleClick}
      onContextMenu={(e) =>
        onNodeContextMenu && onNodeContextMenu(e, nodeDatum)
      }
      style={{
        cursor: isLoading ? 'progress' : isPlaceholder ? 'pointer' : 'pointer',
        opacity: isLoading ? 0.7 : 1
      }}
    >
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
          {/* Base circle in yellow (represents leaf nodes or no assignments) */}
          <circle r={15} fill="#FFFF00" stroke="none" />
          {/* Top half in blue (represents CILT and OPL assignments combined) */}
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
        strokeWidth={nodeDatum.id === "0" ? "0.5" : "0"}
        x={nodeDatum.id === "0" ? -200 : 20}
        y={nodeDatum.id === "0" ? 0 : 20}
        style={{ fontSize: "14px" }}
      >
        {isLoading ? `${displayText} ...` : displayText}
      </text>
    </g>
  );
};

const CiltLevelAssignmentsLazy: React.FC = () => {
  const location = useLocation();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [assignmentCounts, setAssignmentCounts] = useState<{ [key: string]: number }>({});
  const [loadedChildren, setLoadedChildren] = useState<Map<string, Level[]>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [getLevelTreeLazy] = useGetLevelTreeLazyMutation();
  const [createCiltMstrPositionLevel] = useCreateCiltMstrPositionLevelMutation();
  const [createOplLevel] = useCreateOplLevelMutation();
  const [getLevelStats] = useGetLevelStatsMutation();
  const { loadChildren, loadingNodes } = useLazyNode();
  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem("treeExpandedState");
    return storedState === "true";
  });

  const { notification } = AntApp.useApp();
  const { rol } = useCurrentUser();

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<
    "cilt-position" | "opl" | "details"
  >("cilt-position");
  const [drawerPlacement, setDrawerPlacement] = useState<"right" | "bottom">(
    "right"
  );

  const [isAssigning, setIsAssigning] = useState(false);

  const [isLevelDetailsVisible, setIsLevelDetailsVisible] = useState(false);
  const [selectedLevelForDetails, setSelectedLevelForDetails] =
    useState<any>(null);

  const siteName = location.state?.siteName || "Default Site";
  const siteId = location.state?.siteId || "1";

  useEffect(() => {
    handleGetLevels();
  }, []);

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
    localStorage.setItem("treeExpandedState", isTreeExpanded.toString());
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

  // Optimized function to fetch assignment counts without 404 errors
  const fetchAssignmentCountsWithAuth = async (levelIds: string[]) => {
    const assignmentCountsObj: {[key: string]: number} = {};

    try {
      // First, fetch all OPL levels at once to create a lookup map (avoids 404s)
      const allOplLevelsUrl = `${import.meta.env.VITE_API_SERVICE}/opl-levels`;
      const oplResponse = await fetch(allOplLevelsUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      // Create OPL lookup map by levelId
      const oplCountsByLevelId: {[key: string]: number} = {};
      if (oplResponse.ok) {
        const oplData = await oplResponse.json();
        const allOplLevels = oplData.data || oplData || [];

        // Count OPL assignments per level
        allOplLevels.forEach((opl: any) => {
          const levelIdStr = opl.levelId.toString();
          oplCountsByLevelId[levelIdStr] = (oplCountsByLevelId[levelIdStr] || 0) + 1;
        });
      }

      // Process CILT assignments in batches
      const batchSize = 5;
      for (let i = 0; i < levelIds.length; i += batchSize) {
        const batch = levelIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (levelId) => {
          // Fetch CILT assignments for this level
          const ciltUrl = `${import.meta.env.VITE_API_SERVICE}/cilt-mstr-position-levels/level/${levelId}?skipOpl=true`;

          let ciltCount = 0;
          try {
            const ciltResponse = await fetch(ciltUrl, {
              method: 'GET',
              headers: getAuthHeaders()
            });

            if (ciltResponse.ok) {
              const ciltData = await ciltResponse.json();
              const ciltAssignments = ciltData.data || ciltData;
              ciltCount = Array.isArray(ciltAssignments)
                ? ciltAssignments.filter(a => a.status === Constants.STATUS_ACTIVE).length
                : 0;
            }
          } catch (_error) {
            // Handle CILT fetch errors silently
            ciltCount = 0;
          }

          // Get OPL count from pre-built lookup map (no additional requests needed)
          const oplCount = oplCountsByLevelId[levelId] || 0;

          return { levelId, count: ciltCount + oplCount };
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          assignmentCountsObj[result.levelId] = result.count;
        });

        // Small delay between batches to avoid overwhelming the server
        if (i + batchSize < levelIds.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

    } catch (error) {
      console.error('Error fetching assignment counts:', error);
      // Set all counts to 0 in case of error
      levelIds.forEach(levelId => {
        assignmentCountsObj[levelId] = 0;
      });
    }

    return assignmentCountsObj;
  };

  const refreshAssignmentCounts = async () => {
    try {
      // Get active nodes from current tree data
      const getActiveNodesFromTree = (nodes: any[]): string[] => {
        let activeNodeIds: string[] = [];

        const traverse = (nodeList: any[]) => {
          nodeList.forEach(node => {
            if (node.id !== "0" && !node.attributes?.isPlaceholder) {
              activeNodeIds.push(node.id);
            }
            if (node.children && node.children.length > 0) {
              traverse(node.children);
            }
          });
        };

        traverse(nodes);
        return activeNodeIds;
      };

      if (treeData.length === 0) return;

      const activeNodeIds = getActiveNodesFromTree(treeData[0].children || []);

      // Fetch assignment counts with proper authentication
      const assignmentCountsObj = await fetchAssignmentCountsWithAuth(activeNodeIds);

      // Update state with assignment counts
      setAssignmentCounts(assignmentCountsObj);
    } catch (error) {
      console.error('Error refreshing assignment counts:', error);
    }
  };

  const handleGetLevels = async () => {
    setIsLoading(true);
    setLoadingProgress(10);

    try {
      // Get stats first to check total levels
      const stats = await getLevelStats(siteId.toString()).unwrap();

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

      const isExpanded = localStorage.getItem("treeExpandedState") === "true";

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

      // Fetch assignment counts for active nodes using authenticated requests
      const activeNodeIds = activeNodes.map(node => node.id.toString());
      const assignmentCountsObj = await fetchAssignmentCountsWithAuth(activeNodeIds);
      setLoadingProgress(90);

      // Update state with assignment counts
      setAssignmentCounts(assignmentCountsObj);
      setLoadingProgress(100);

      setTreeData([
        {
          name: `${Strings.levelsOf} ${siteName}`,
          id: "0",
          attributes: {
            isRoot: true,
            originalData: activeNodes  // Store original data for rebuilding
          },
          children: hierarchyData,
        },
      ]);

      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      console.error(Strings.errorOccurred, error);
    } finally {
      setIsLoading(false);
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

          // Fetch assignment counts for new children
          const childIds = children.map(child => child.id.toString());
          const newAssignmentCounts = await fetchAssignmentCountsWithAuth(childIds);

          setAssignmentCounts(prev => ({ ...prev, ...newAssignmentCounts }));
        }
      } catch (error) {
        console.error("Error loading children:", error);
        notification.error({
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
        const children = await loadChildren(parseInt(siteId), nodeId);

        if (children && children.length > 0) {
          setLoadedChildren(prev => {
            const newMap = new Map(prev);
            newMap.set(nodeId, children);
            return newMap;
          });

          // Fetch assignment counts for new children
          const childIds = children.map(child => child.id.toString());
          const newAssignmentCounts = await fetchAssignmentCountsWithAuth(childIds);

          setAssignmentCounts(prev => ({ ...prev, ...newAssignmentCounts }));
        }
      } catch (error) {
        console.error("Error loading node children:", error);
      }
    }
  }, [loadChildren, loadingNodes, siteId, notification]);

  // Update tree data when loaded children changes
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

  const expandAllNodes = () => {
    notification.warning({
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
      collapseNodes(treeData[0].children);
      localStorage.setItem("treeExpandedState", "false");
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

  const handleNodeContextMenu = (e: React.MouseEvent, nodeData: any) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't show context menu for placeholder nodes
    if (nodeData.attributes?.isPlaceholder) {
      return;
    }

    // Get the current node's position and set the menu just to the right
    const offsetX = (e.currentTarget as Element).getBoundingClientRect().right - 300;
    const offsetY = (e.currentTarget as Element).getBoundingClientRect().top -200;

    setContextMenuVisible(true);
    setContextMenuPos({ x: offsetX + 15, y: offsetY });
    setSelectedNode(nodeData);
  };

  const handleSeeAssignments = () => {
    if (selectedNode && selectedNode.id !== "0" && !selectedNode.attributes?.isPlaceholder) {
      // Show the level details drawer instead of the assignment drawer
      setSelectedLevelForDetails(selectedNode);
      setIsLevelDetailsVisible(true);
      setContextMenuVisible(false);
    } else {
      setContextMenuVisible(false);
    }
  };

  const handleNodeClick = (_event: React.MouseEvent, nodeDatum: any) => {
    if (!nodeDatum.attributes?.isPlaceholder && (!nodeDatum.children || nodeDatum.children.length === 0)) {
      console.log("handleNodeClick - nodeDatum:", nodeDatum);
      setSelectedLevelForDetails(nodeDatum);
      setIsLevelDetailsVisible(true);
      console.log(
        "handleNodeClick - selectedLevelForDetails after set:",
        nodeDatum
      );
    }
  };

  const handleAssignPositionCiltMstr = () => {
    if (!selectedNode || selectedNode.attributes?.isPlaceholder) {
      notification.warning({
        message: Strings.error,
        description: Strings.noValidLevelId,
      });
      setContextMenuVisible(false);
      return;
    }


    if (selectedNode.id === "0") {
      notification.warning({
        message: Strings.error,
        description: Strings.noValidLevelId,
      });
      setContextMenuVisible(false);
      return;
    }

    const nodeData = {
      ...selectedNode,
      id: selectedNode.id ? String(selectedNode.id).replace(/[^0-9]/g, '') : null,
    };

    console.log("Nodo seleccionado para asignación:", nodeData);
    setSelectedNode(nodeData);
    setContextMenuVisible(false);
    setIsDrawerVisible(true);
    setDrawerType("cilt-position");
  };

  const handleAssignOpl = () => {
    if (selectedNode?.attributes?.isPlaceholder) {
      return;
    }
    setContextMenuVisible(false);
    setIsDrawerVisible(true);
    setDrawerType("opl");
  };

  const handleCiltAssignment = async (payload: any) => {
    setIsAssigning(true);
    try {
      console.log("Payload received in handleCiltAssignment:", payload);

      // Verify all required fields exist
      if (!payload.siteId || !payload.ciltMstrId || !payload.positionId || !payload.levelId) {
        console.error("Incomplete payload:", payload);
        throw new Error("Incomplete data for assignment");
      }

      // Make sure levelId is a valid number
      let levelId;

      // If levelId contains non-numeric characters, extract only the numeric part
      if (typeof payload.levelId === 'string' && payload.levelId.match(/[^0-9]/)) {
        levelId = Number(payload.levelId.replace(/[^0-9]/g, ''));
        console.log("Extracted numeric levelId from string:", levelId);
      } else {
        levelId = Number(payload.levelId);
      }

      if (isNaN(levelId) || levelId <= 0) {
        console.error("Invalid level ID:", payload.levelId);
        throw new Error(Strings.noValidLevelId);
      }

      const validatedPayload = {
        siteId: Number(payload.siteId),
        ciltMstrId: Number(payload.ciltMstrId),
        positionId: Number(payload.positionId),
        levelId: levelId,  // Already validated as a number
        status: payload.status || "A",  // Use "A" as default if not provided
      };

      console.log("Validated payload to send to API:", validatedPayload);

      const result = await createCiltMstrPositionLevel(validatedPayload).unwrap();
      console.log("Assignment result:", result);

      // Refresh assignment counts to show the new assignment immediately
      await refreshAssignmentCounts();

      // Show success notification with localized message
      notification.success({
        message: Strings.success,
        description: Strings.assignmentSuccessful,
      });
    } catch (error: any) {
      console.error("Error in assignment:", error);

      // Extract more detailed error message if possible
      let errorMessage = Strings.errorOccurred;

      if (error && typeof error === "object") {
        if ("data" in error && error.data) {
          console.error("Error data:", error.data);

          if (typeof error.data === "object" && "message" in error.data) {
            errorMessage = error.data.message;
          }
        } else if ("message" in error) {
          errorMessage = error.message;
        }
      }

      AnatomyNotification.error(notification, errorMessage);
    } finally {
      setIsAssigning(false);
      setIsDrawerVisible(false);
    }
  };

  const handleOplAssignment = async (payload: any) => {
    setIsAssigning(true);
    try {
      const validatedPayload = {
        oplId: Number(payload.oplId),
        levelId: Number(payload.levelId),
      };

      await createOplLevel(validatedPayload).unwrap();

      // Refresh assignment counts to show the new assignment immediately
      await refreshAssignmentCounts();

      // Success notification is handled by the child component
      // Close the drawer after successful assignment
      setIsDrawerVisible(false);
    } catch (error) {
      console.error(Strings.oplErrorAssigning, error);

      if (error && typeof error === "object" && "data" in error) {
        console.error(Strings.oplErrorAssigning, error.data);
        AnatomyNotification.error(notification, Strings.oplErrorAssigning);
      } else {
        AnatomyNotification.error(notification, Strings.oplErrorAssigning);
      }
      // Re-throw error so the child component can handle it
      throw error;
    } finally {
      setIsAssigning(false);
      // Don't automatically close the drawer here, let the child component handle it
    }
  };

  const content = (
    <div>
      <div
        ref={containerRef}
        className="flex-grow border border-gray-300 shadow-md rounded-md m-4 p-4 relative overflow-hidden"
        style={{ height: "calc(100vh - 12rem)" }}
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
            {/* Expand/Collapse all nodes button */}
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
                  <CustomNode
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
                    onNodeContextMenu={handleNodeContextMenu}
                    onNodeClick={handleNodeClick}
                    assignmentCounts={assignmentCounts}
                    isLoading={
                      loadingNodes.has(rd3tProps.nodeDatum.id) ||
                      (rd3tProps.nodeDatum.attributes?.isPlaceholder &&
                       loadingNodes.has(rd3tProps.nodeDatum.id.replace('_placeholder', '')))
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

            {/* Context Menu */}
            <div ref={contextMenuRef}>
              <CiltLevelMenuOptions
                isVisible={contextMenuVisible}
                role={rol}
                contextMenuPos={contextMenuPos}
                handleAssignPositionCiltMstr={handleAssignPositionCiltMstr}
                handleAssignOpl={handleAssignOpl}
                handleSeeAssignments={handleSeeAssignments}
              />
            </div>

            {/* CILT Assignment Drawer */}
            {drawerType === "cilt-position" && (
              <CiltAssignmentDrawer
                isVisible={isDrawerVisible && drawerType === "cilt-position"}
                siteId={siteId}
                placement={drawerPlacement}
                onClose={() => setIsDrawerVisible(false)}
                onAssign={handleCiltAssignment}
                selectedNode={selectedNode}
                drawerType={"cilt-position"}
                isSubmitting={isAssigning}
                onSuccess={() => {
                  // Refresh assignment counts after successful assignment
                  refreshAssignmentCounts();
                }}
              />
            )}

            {/* OPL Assignment Drawer */}
            {drawerType === "opl" && (
              <OplAssignmentDrawer
                isVisible={isDrawerVisible && drawerType === "opl"}
                siteId={siteId}
                placement={drawerPlacement}
                onClose={() => setIsDrawerVisible(false)}
                onAssign={handleOplAssignment}
                selectedNode={selectedNode}
                isSubmitting={isAssigning}
              />
            )}

            {/* Drawer para mostrar detalles del nivel */}
            <LevelDetailsDrawer
              visible={isLevelDetailsVisible}
              levelId={selectedLevelForDetails?.id}
              levelName={selectedLevelForDetails?.name}
              onClose={() => setIsLevelDetailsVisible(false)}
            />
          </>
        )}
      </div>
    </div>
  );

  return (
    <MainContainer
      title={Strings.empty}
      content={content}
      enableSearch={false}
    />
  );
};

export default CiltLevelAssignmentsLazy;