import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button, Spin, theme, App as AntApp } from "antd";
import Tree from "react-d3-tree";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import Constants from "../../utils/Constants";
import CiltLevelMenuOptions from "./components/CiltLevelMenuOptions";
import CiltAssignmentDrawer from "./components/CiltAssignmentDrawer";
import LevelDetailsDrawer from "./components/LevelDetailsDrawer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { useGetlevelsMutation } from "../../services/levelService";
import { Level } from "../../data/level/level";
import AnatomyNotification from "../components/AnatomyNotification";

import { useCreateCiltMstrPositionLevelMutation } from "../../services/cilt/assignaments/ciltMstrPositionsLevelsService";
import { useCreateOplLevelMutation } from "../../services/cilt/assignaments/oplLevelService";
import OplAssignmentDrawer from "./components/OplAssignmentDrawer";

const buildHierarchy = (data: Level[]) => {
  const map: { [key: string]: any } = {};
  const tree: any[] = [];

  data.forEach((node) => {
    map[node.id] = {
      ...node,
      attributes: {},
      children: [],
    };
  });

  data.forEach((node) => {
    const superiorId = node.superiorId;
    if (superiorId === "0" || !superiorId) {
      tree.push(map[node.id]);
    } else if (map[superiorId]) {
      map[superiorId].children.push(map[node.id]);
    }
  });

  return tree;
};

const CustomNode = ({
  nodeDatum,
  toggleNode,
  onNodeContextMenu,
  assignmentCounts = {},
}: any) => {
  const { token } = theme.useToken();

  const isCollapsed =
    localStorage.getItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeDatum.id}${Constants.nodeEndBridgeCollapserd}`
    ) === "true";

  nodeDatum.__rd3t = nodeDatum.__rd3t || {};
  nodeDatum.__rd3t.collapsed = isCollapsed;

  const isLeafNode = !nodeDatum.children || nodeDatum.children.length === 0;

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

  // Default fill color
  const fillColor = isLeafNode ? "#FFFF00" : "#145695";

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
    >
      {showSplitColors ? (
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
        fill={token.colorText}
        strokeWidth={nodeDatum.id === "0" ? "0.5" : "0"}
        x={nodeDatum.id === "0" ? -200 : 20}
        y={nodeDatum.id === "0" ? 0 : 20}
        style={{ fontSize: "14px" }}
      >
        {displayText}
      </text>
    </g>
  );
};

const CiltLevelAssignaments: React.FC = () => {
  const location = useLocation();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [assignmentCounts, setAssignmentCounts] = useState<{ [key: string]: number }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [getLevels] = useGetlevelsMutation();
  const [createCiltMstrPositionLevel] = useCreateCiltMstrPositionLevelMutation();
  const [createOplLevel] = useCreateOplLevelMutation();
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

  const refreshAssignmentCounts = async () => {
    try {
      // Get active nodes from current tree data
      const getActiveNodesFromTree = (nodes: any[]): any[] => {
        let activeNodes: any[] = [];
        
        const traverse = (nodeList: any[]) => {
          nodeList.forEach(node => {
            if (node.id !== "0") {
              activeNodes.push({ id: node.id, name: node.name });
            }
            if (node.children && node.children.length > 0) {
              traverse(node.children);
            }
          });
        };
        
        traverse(nodes);
        return activeNodes;
      };

      if (treeData.length === 0) return;
      
      const activeNodes = getActiveNodesFromTree(treeData[0].children || []);
      
      // Fetch both CILT and OPL assignment counts for tree display
      const assignmentCountsObj: {[key: string]: number} = {};
      
      // Create batched requests with proper error handling for both CILT and OPL
      const fetchAssignmentCounts = async (levels: any[]) => {
        // Batch CILT assignments request
        const ciltPromises = levels.map(async (level) => {
          try {
            const ciltResponse = await fetch(
              `${import.meta.env.VITE_API_SERVICE}/cilt-mstr-position-levels/level/${level.id}?skipOpl=true`,
              {
                method: 'GET',
                headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (ciltResponse.ok) {
              const ciltData = await ciltResponse.json();
              const ciltAssignments = ciltData.data || ciltData;
              return {
                levelId: level.id,
                count: Array.isArray(ciltAssignments) ? ciltAssignments.filter(a => a.status === Constants.STATUS_ACTIVE).length : 0,
                type: 'cilt'
              };
            }
            return { levelId: level.id, count: 0, type: 'cilt' };
          } catch (_error) {
            // Silently handle CILT fetch errors to reduce console noise
            return { levelId: level.id, count: 0, type: 'cilt' };
          }
        });

        // Batch OPL assignments request (404s are expected for levels without OPL assignments)
        const oplPromises = levels.map(async (level) => {
          try {
            const oplResponse = await fetch(
              `${import.meta.env.VITE_API_SERVICE}/opl-levels/level/${level.id}`,
              {
                method: 'GET',
                headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (oplResponse.ok) {
              const oplData = await oplResponse.json();
              const oplAssignments = oplData.data || oplData;
              return {
                levelId: level.id,
                count: Array.isArray(oplAssignments) ? oplAssignments.length : 0,
                type: 'opl'
              };
            }
            return { levelId: level.id, count: 0, type: 'opl' };
          } catch (_error) {
            // Silently handle OPL fetch errors (404s are expected for levels without OPL assignments)
            return { levelId: level.id, count: 0, type: 'opl' };
          }
        });

        // Execute requests in batches to avoid overwhelming the server
        const chunkSize = 5; // Process 5 levels at a time to reduce server load
        const ciltCounts: {[key: string]: number} = {};
        const oplCounts: {[key: string]: number} = {};

        // Process CILT assignments in chunks
        for (let i = 0; i < ciltPromises.length; i += chunkSize) {
          const chunk = ciltPromises.slice(i, i + chunkSize);
          const results = await Promise.all(chunk);
          results.forEach(result => {
            ciltCounts[result.levelId] = result.count;
          });
          
          // Small delay between chunks to avoid overwhelming the server
          if (i + chunkSize < ciltPromises.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Process OPL assignments in chunks
        for (let i = 0; i < oplPromises.length; i += chunkSize) {
          const chunk = oplPromises.slice(i, i + chunkSize);
          const results = await Promise.all(chunk);
          results.forEach(result => {
            oplCounts[result.levelId] = result.count;
          });
          
          // Small delay between chunks to avoid overwhelming the server
          if (i + chunkSize < oplPromises.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Combine CILT and OPL counts for tree display
        levels.forEach(level => {
          const ciltCount = ciltCounts[level.id] || 0;
          const oplCount = oplCounts[level.id] || 0;
          assignmentCountsObj[level.id] = ciltCount + oplCount;
        });
      };

      // Fetch assignment counts for active nodes only
      await fetchAssignmentCounts(activeNodes);
      
      // Update state with assignment counts
      setAssignmentCounts(assignmentCountsObj);
    } catch (error) {
      console.error('Error refreshing assignment counts:', error);
    }
  };

  const handleGetLevels = async () => {
    setIsLoading(true);
    try {
      const response = await getLevels(siteId).unwrap();
      
      const activeNodes = response.filter((node: any) => !node.deletedAt);
    
      
      const hierarchyData = buildHierarchy(activeNodes);

      const isExpanded = localStorage.getItem("treeExpandedState") === "true";

      const applyExpandState = (nodes: any[]) => {
        nodes.forEach((node) => {
          if (node.id !== "0") {
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

      // Fetch both CILT and OPL assignment counts for tree display
      const assignmentCountsObj: {[key: string]: number} = {};
      
      // Create batched requests with proper error handling for both CILT and OPL
      const fetchAssignmentCounts = async (levels: any[]) => {
        // Batch CILT assignments request
        const ciltPromises = levels.map(async (level) => {
          try {
            const ciltResponse = await fetch(
              `${import.meta.env.VITE_API_SERVICE}/cilt-mstr-position-levels/level/${level.id}?skipOpl=true`,
              {
                method: 'GET',
                headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (ciltResponse.ok) {
              const ciltData = await ciltResponse.json();
              const ciltAssignments = ciltData.data || ciltData;
              return {
                levelId: level.id,
                count: Array.isArray(ciltAssignments) ? ciltAssignments.filter(a => a.status === Constants.STATUS_ACTIVE).length : 0,
                type: 'cilt'
              };
            }
            return { levelId: level.id, count: 0, type: 'cilt' };
          } catch (_error) {
            // Silently handle CILT fetch errors to reduce console noise
            return { levelId: level.id, count: 0, type: 'cilt' };
          }
        });

        // Batch OPL assignments request (404s are expected for levels without OPL assignments)
        const oplPromises = levels.map(async (level) => {
          try {
            const oplResponse = await fetch(
              `${import.meta.env.VITE_API_SERVICE}/opl-levels/level/${level.id}`,
              {
                method: 'GET',
                headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (oplResponse.ok) {
              const oplData = await oplResponse.json();
              const oplAssignments = oplData.data || oplData;
              return {
                levelId: level.id,
                count: Array.isArray(oplAssignments) ? oplAssignments.length : 0,
                type: 'opl'
              };
            }
            return { levelId: level.id, count: 0, type: 'opl' };
          } catch (_error) {
            // Silently handle OPL fetch errors (404s are expected for levels without OPL assignments)
            return { levelId: level.id, count: 0, type: 'opl' };
          }
        });

        // Execute requests in batches to avoid overwhelming the server
        const chunkSize = 5; // Process 5 levels at a time to reduce server load
        const ciltCounts: {[key: string]: number} = {};
        const oplCounts: {[key: string]: number} = {};

        // Process CILT assignments in chunks
        for (let i = 0; i < ciltPromises.length; i += chunkSize) {
          const chunk = ciltPromises.slice(i, i + chunkSize);
          const results = await Promise.all(chunk);
          results.forEach(result => {
            ciltCounts[result.levelId] = result.count;
          });
          
          // Small delay between chunks to avoid overwhelming the server
          if (i + chunkSize < ciltPromises.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Process OPL assignments in chunks
        for (let i = 0; i < oplPromises.length; i += chunkSize) {
          const chunk = oplPromises.slice(i, i + chunkSize);
          const results = await Promise.all(chunk);
          results.forEach(result => {
            oplCounts[result.levelId] = result.count;
          });
          
          // Small delay between chunks to avoid overwhelming the server
          if (i + chunkSize < oplPromises.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Combine CILT and OPL counts for tree display
        levels.forEach(level => {
          const ciltCount = ciltCounts[level.id] || 0;
          const oplCount = oplCounts[level.id] || 0;
          assignmentCountsObj[level.id] = ciltCount + oplCount;
        });
      };

      // Fetch assignment counts for active nodes only
      await fetchAssignmentCounts(activeNodes);
      
      // Update state with assignment counts
      setAssignmentCounts(assignmentCountsObj);

      setTreeData([
        {
          name: `${Strings.levelsOf} ${siteName}`,
          id: "0",
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
    }
  };

  const expandAllNodes = () => {
    const expandNodes = (nodes: any[]) => {
      nodes.forEach((node) => {
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
      expandNodes(treeData[0].children);
      localStorage.setItem("treeExpandedState", "true");
      // Only refresh tree structure, don't refetch assignment counts
      setIsTreeExpanded(true);
      // Force re-render to show expanded state
      setTreeData([...treeData]);
    }
  };

  const collapseAllNodes = () => {
    const collapseNodes = (nodes: any[]) => {
      nodes.forEach((node) => {
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
      collapseNodes(treeData[0].children);
      localStorage.setItem("treeExpandedState", "false");
      // Only refresh tree structure, don't refetch assignment counts
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
    
    // Get the current node's position and set the menu just to the right
    const offsetX = (e.currentTarget as Element).getBoundingClientRect().right - 300;
    const offsetY = (e.currentTarget as Element).getBoundingClientRect().top -200;
    
    setContextMenuVisible(true);
    setContextMenuPos({ x: offsetX + 15, y: offsetY });
    setSelectedNode(nodeData);
  };

  const handleSeeAssignments = () => {
    if (selectedNode && selectedNode.id !== "0") {
      // Show the level details drawer instead of the assignment drawer
      setSelectedLevelForDetails(selectedNode);
      setIsLevelDetailsVisible(true);
      setContextMenuVisible(false);
    } else {
      setContextMenuVisible(false);
    }
  };

  const handleNodeClick = (_event: React.MouseEvent, nodeDatum: any) => {
    if (!nodeDatum.children || nodeDatum.children.length === 0) {
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
    if (!selectedNode) {
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
        {isLoading ? (
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
                    toggleNode={rd3tProps.toggleNode}
                    onNodeContextMenu={handleNodeContextMenu}
                    onNodeClick={handleNodeClick}
                    assignmentCounts={assignmentCounts}
                  />
                )}
                collapsible={true}
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
                  // Refresh the tree after successful assignment
                  handleGetLevels();
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

export default CiltLevelAssignaments;
