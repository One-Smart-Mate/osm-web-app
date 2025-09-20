import React, { useState, useEffect, useRef, useCallback } from "react";
import Tree from "react-d3-tree";
import { Spin, Button, Empty, theme, notification } from "antd";
import { useGetlevelsMutation } from "../../../services/levelService";
import {
  useGetProceduresByLevelMutation
} from "../../../services/procedureService";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import TreeLegend from "./TreeLegend";
import AnatomyNotification from "../../components/AnatomyNotification";

interface ProceduresTreeProps {
  siteId: string;
  siteName?: string;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'level' | 'position' | 'procedure' | 'sequence';
  children?: TreeNode[];
  data?: any;
  attributes?: any;
}

const ProceduresTree: React.FC<ProceduresTreeProps> = ({ siteId, siteName }) => {
  const { token } = theme.useToken();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevelProcedures, setSelectedLevelProcedures] = useState<Map<string, any>>(new Map());
  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem('proceduresTreeExpandedState');
    return storedState === 'true';
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const [getLevels] = useGetlevelsMutation();
  const [getProceduresByLevel] = useGetProceduresByLevelMutation();

  // Build tree hierarchy from levels data
  const buildHierarchy = useCallback((levels: any[]): TreeNode[] => {
    const map: { [key: string]: TreeNode } = {};
    const tree: TreeNode[] = [];

    // Create nodes for each level
    levels.forEach((level) => {
      map[level.id] = {
        id: level.id,
        name: level.name,
        type: 'level',
        data: level,
        children: [],
      };
    });

    // Build parent-child relationships
    levels.forEach((level) => {
      const superiorId = level.superiorId;
      if (superiorId === "0" || !superiorId) {
        tree.push(map[level.id]);
      } else if (map[superiorId]) {
        map[superiorId].children?.push(map[level.id]);
      }
    });

    return tree;
  }, []);

  // Load initial levels
  const loadLevels = useCallback(async (autoLoadProcedures = false) => {
    if (!siteId) return;

    setIsLoading(true);
    try {
      const response = await getLevels(siteId).unwrap();
      const activeNodes = response.filter((node: any) => !node.deletedAt);
      const hierarchyData = buildHierarchy(activeNodes);

      const rootNode = {
        id: "0",
        name: `${Strings.proceduresOf} ${siteName || Strings.defaultSiteName}`,
        type: 'level' as const,
        children: hierarchyData,
      };

      setTreeData([rootNode]);

      // Center the tree
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }

      // Auto-load all procedures if requested
      if (autoLoadProcedures) {
        await loadAllProcedures([rootNode]);
      }
    } catch (error) {
      console.error("Error loading levels:", error);
      AnatomyNotification.error(notificationApi, Strings.errorLoadingLevels);
    } finally {
      setIsLoading(false);
    }
  }, [siteId, siteName, getLevels, buildHierarchy]);

  useEffect(() => {
    // Check if we should auto-expand on initial load
    const shouldAutoExpand = localStorage.getItem('proceduresTreeExpandedState') === 'true';
    loadLevels(shouldAutoExpand);
  }, []);

  // Load procedures for a level when expanded
  const loadProceduresForLevel = useCallback(async (levelId: string): Promise<any[]> => {
    if (selectedLevelProcedures.has(levelId)) {
      return selectedLevelProcedures.get(levelId) || []; // Already loaded
    }

    try {
      const response = await getProceduresByLevel(levelId).unwrap();
      setSelectedLevelProcedures(prev => new Map(prev).set(levelId, response));
      return response;
    } catch (error) {
      console.error("Error loading procedures:", error);
      AnatomyNotification.error(notificationApi, Strings.errorLoadingProcedures);
      return [];
    }
  }, [getProceduresByLevel, selectedLevelProcedures]);

  // Build procedure nodes from procedures data
  const buildProcedureNodes = (procedures: any[]): TreeNode[] => {
    // Group procedures by position
    const positionsMap = new Map<number, any[]>();

    procedures.forEach(proc => {
      if (proc.position) {
        if (!positionsMap.has(proc.position.id)) {
          positionsMap.set(proc.position.id, []);
        }
        positionsMap.get(proc.position.id)?.push(proc);
      }
    });

    // Create position nodes with procedures
    const procedureNodes: TreeNode[] = [];
    positionsMap.forEach((procs, positionId) => {
      const position = procs[0].position;

      procedureNodes.push({
        id: `position-${positionId}`,
        name: position.name,
        type: 'position',
        data: position,
        children: procs.map(proc => ({
          id: `procedure-${proc.id}`,
          name: proc.ciltMstr?.ciltName || Strings.unnamed,
          type: 'procedure',
          data: proc,
          children: proc.ciltMstr?.sequences?.map((seq: any) => ({
            id: `sequence-${seq.id}`,
            name: seq.ciltMstrName || seq.name || `${Strings.sequence} ${seq.id}`,
            type: 'sequence',
            data: seq,
            children: [],
          })) || [],
        })),
      });
    });

    return procedureNodes;
  };

  // Load all procedures for all levels and rebuild tree
  const loadAllProcedures = useCallback(async (nodes: TreeNode[]) => {
    const proceduresMap = new Map<string, any[]>();
    const levelIds: string[] = [];

    // Collect all level IDs that need loading
    const collectLevelIds = (nodeList: TreeNode[]) => {
      nodeList.forEach(node => {
        if (node.type === 'level' && node.id !== "0") {
          levelIds.push(node.id);
        }
        if (node.children && node.children.length > 0) {
          collectLevelIds(node.children);
        }
      });
    };

    collectLevelIds(nodes);

    if (levelIds.length === 0) return;

    try {
      // Load all procedures in parallel
      const loadPromises = levelIds.map(async (levelId) => {
        const procedures = await loadProceduresForLevel(levelId);
        proceduresMap.set(levelId, procedures);
      });

      await Promise.all(loadPromises);

      // Now rebuild the entire tree with all procedures
      setTreeData(prevData => {
        const rebuildWithProcedures = (nodeList: TreeNode[]): TreeNode[] => {
          return nodeList.map(node => {
            if (node.type === 'level' && proceduresMap.has(node.id)) {
              const procedures = proceduresMap.get(node.id) || [];
              const procedureNodes = buildProcedureNodes(procedures);

              // Filter out any existing procedure/position nodes to avoid duplicates
              const levelChildren = (node.children || []).filter(
                child => child.type === 'level'
              );

              return {
                ...node,
                children: [...levelChildren, ...procedureNodes],
              };
            }

            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: rebuildWithProcedures(node.children),
              };
            }

            return node;
          });
        };

        return rebuildWithProcedures(prevData);
      });
    } catch (_error) {
      AnatomyNotification.error(notificationApi, Strings.errorLoadingSomeProcedures);
    }
  }, [loadProceduresForLevel, buildProcedureNodes]);

  // Expand/collapse all nodes functions
  const expandAllNodes = async () => {
    setIsLoading(true);

    // First, load all procedures for all levels
    await loadAllProcedures(treeData);

    const expandNodes = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        localStorage.setItem(
          `${Constants.nodeStartBridgeCollapsed}procedures_${node.id}${Constants.nodeEndBridgeCollapserd}`,
          "false"
        );

        if (node.children && node.children.length > 0) {
          expandNodes(node.children);
        }
      });
    };

    if (treeData.length > 0) {
      expandNodes(treeData);
      localStorage.setItem('proceduresTreeExpandedState', 'true');
      setIsTreeExpanded(true);
    }

    setIsLoading(false);
  };

  const collapseAllNodes = () => {
    const collapseNodes = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.id !== "0") {
          localStorage.setItem(
            `${Constants.nodeStartBridgeCollapsed}procedures_${node.id}${Constants.nodeEndBridgeCollapserd}`,
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
      localStorage.setItem('proceduresTreeExpandedState', 'false');
      loadLevels(); // Reload to apply state
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


  // Helper functions for collapsed state management
  const getCollapsedState = (nodeId: string): boolean => {
    const storedState = localStorage.getItem(
      `${Constants.nodeStartBridgeCollapsed}procedures_${nodeId}${Constants.nodeEndBridgeCollapserd}`
    );
    return storedState === "true";
  };

  const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
    localStorage.setItem(
      `${Constants.nodeStartBridgeCollapsed}procedures_${nodeId}${Constants.nodeEndBridgeCollapserd}`,
      isCollapsed.toString()
    );
  };

  // Custom node element renderer - consistent with LevelsPage
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const node = nodeDatum as TreeNode;
    const isCollapsed = getCollapsedState(node.id);
    nodeDatum.__rd3t.collapsed = isCollapsed;

    const isLeafNode = !node.children || node.children.length === 0;
    const procedures = selectedLevelProcedures.get(node.id);
    const procedureCount = procedures ? procedures.length : 0;
    const hasLoadedProcedures = selectedLevelProcedures.has(node.id);

    // Determine fill color based on node type
    let fillColor = "#145695"; // Default blue for folders
    if (node.type === 'position') {
      fillColor = "#52c41a"; // Green for positions
    } else if (node.type === 'procedure') {
      fillColor = "#fa8c16"; // Orange for procedures
    } else if (node.type === 'sequence') {
      fillColor = "#722ed1"; // Purple for sequences
    } else if (isLeafNode && node.type === 'level' && hasLoadedProcedures) {
      fillColor = "#FFFF00"; // Yellow for leaf levels
    }

    // Display text with count or loading indicator
    let displayText = node.name;
    if (node.type === 'level') {
      if (!hasLoadedProcedures && node.id !== "0") {
        displayText += " (?)"; // Shows that data needs to be loaded
      } else if (procedureCount > 0) {
        displayText += ` (${procedureCount})`;
      } else if (hasLoadedProcedures && procedureCount === 0) {
        displayText += " (0)";
      }
    } else if (node.type === 'position' && node.children) {
      displayText += ` (${node.children.length})`;
    } else if (node.type === 'procedure' && node.children) {
      displayText += ` (${node.children.length} seq.)`;
    }

    const handleClick = (e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();

      // Always toggle node if it has children
      if (node.children && node.children.length > 0) {
        const newCollapsedState = !nodeDatum.__rd3t.collapsed;
        setCollapsedState(node.id, newCollapsedState);
        toggleNode();
      }

      // Load procedures for level nodes when expanding (after toggling)
      if (node.type === 'level' && node.id !== "0") {
        // Check if we're expanding (collapsed state is the opposite of what we want)
        const isExpanding = nodeDatum.__rd3t.collapsed; // If it was collapsed, we're now expanding
        if (isExpanding && !selectedLevelProcedures.has(node.id)) {
          loadProceduresForLevel(node.id).then(procedures => {
            // Update tree with the loaded procedures
            setTreeData(prevData => {
              const updateNode = (nodes: TreeNode[]): TreeNode[] => {
                return nodes.map(n => {
                  if (n.id === node.id) {
                    const procedureNodes = buildProcedureNodes(procedures);
                    const levelChildren = (n.children || []).filter(
                      child => child.type === 'level'
                    );
                    return {
                      ...n,
                      children: [...levelChildren, ...procedureNodes],
                    };
                  }
                  if (n.children) {
                    return {
                      ...n,
                      children: updateNode(n.children),
                    };
                  }
                  return n;
                });
              };
              return updateNode(prevData);
            });
          });
        }
      }
    };

    return (
      <g onClick={handleClick} style={{ cursor: 'pointer' }}>
        <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
        <text
          fill={token.colorText}
          strokeWidth={node.id === "0" ? "0.8" : "0"}
          x={node.id === "0" ? -300 : 20}
          y={node.id === "0" ? 0 : 20}
          style={{ fontSize: node.id === "0" ? "16px" : "14px", fontWeight: node.id === "0" ? "bold" : "normal" }}
        >
          {displayText}
        </text>

      </g>
    );
  };

  return (
    <>
      {contextHolder}
      <div
        ref={containerRef}
        className="flex-grow border border-gray-300 shadow-md rounded-md m-4 p-4 relative overflow-hidden"
        style={{ height: "calc(100vh - 250px)" }}
      >
        {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Expand/Collapse all button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              type={isTreeExpanded ? "default" : "primary"}
              onClick={toggleAllNodes}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isTreeExpanded ? Strings.collapseAll : Strings.expandAll}
            </Button>
          </div>

          {/* Legend */}
          <TreeLegend showOpl={false} />

          {treeData.length > 0 ? (
            <Tree
              data={treeData}
              orientation="horizontal"
              translate={translate}
              nodeSize={{ x: 200, y: 80 }}
              separation={{ siblings: 1, nonSiblings: 1.2 }}
              renderCustomNodeElement={renderCustomNodeElement}
              collapsible={true}
            />
          ) : (
            <Empty
              description={Strings.noLevelsFound}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </>
      )}
      </div>
    </>
  );
};

export default ProceduresTree;