import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tree from "react-d3-tree";
import { Spin, Empty, theme, notification, Progress } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useGetChildrenLevelsMutation } from "../../services/levelService";
import { useGetProceduresByLevelMutation } from "../../services/procedureService";
import Strings from "../../utils/localizations/Strings";
import Constants from "../../utils/Constants";
import TreeLegend from "./components/TreeLegend";
import AnatomyNotification from "../components/AnatomyNotification";
import MainContainer from "../layouts/MainContainer";
import { UnauthorizedRoute } from "../../utils/Routes";

interface TreeNode {
  id: string;
  name: string;
  type: 'level' | 'position' | 'procedure' | 'sequence';
  children?: TreeNode[];
  data?: any;
  attributes?: any;
  __rd3t?: any;
}

const ProceduresTreePageLazy = (): React.ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();
  const siteId = location.state?.siteId || "";
  const siteName = location.state?.siteName || "";

  const { token } = theme.useToken();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
  const [selectedLevelProcedures, setSelectedLevelProcedures] = useState<Map<string, any>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const [getChildrenLevels] = useGetChildrenLevelsMutation();
  const [getProceduresByLevel] = useGetProceduresByLevelMutation();

  // Navigate if unauthorized
  useEffect(() => {
    if (!location.state || !siteId) {
      navigate(UnauthorizedRoute);
    }
  }, [location.state, siteId, navigate]);

  // Load root levels (first level only)
  const loadRootLevels = useCallback(async () => {
    if (!siteId) return;

    setIsLoading(true);
    setLoadingProgress(10);
    try {
      // Load only first level children (parentId = 0)
      const response = await getChildrenLevels({
        siteId: siteId.toString(),
        parentId: 0
      }).unwrap();
      setLoadingProgress(50);

      const activeNodes = response.filter((node: any) => !node.deletedAt);

      // Build tree nodes with placeholders for children
      const hierarchyData: TreeNode[] = activeNodes.map((level: any) => ({
        id: level.id.toString(),
        name: level.name,
        type: 'level',
        data: level,
        children: [{
          id: `placeholder-${level.id}`,
          name: "...",
          type: 'level',
          attributes: {
            isPlaceholder: true,
            parentId: level.id.toString(),
          },
        }],
      }));

      const rootNode: TreeNode = {
        id: "0",
        name: `${Strings.proceduresOf} ${siteName || Strings.defaultSiteName}`,
        type: 'level',
        children: hierarchyData,
      };

      setTreeData([rootNode]);
      setLoadingProgress(90);

      // Center the tree
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
      setLoadingProgress(100);
    } catch (error) {
      console.error("Error loading levels:", error);
      AnatomyNotification.error(notificationApi, Strings.errorLoadingLevels);
    } finally {
      setIsLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  }, [siteId, siteName, getChildrenLevels]);

  useEffect(() => {
    loadRootLevels();
  }, [loadRootLevels]);

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

  // Load children for a node
  const loadNodeChildren = useCallback(async (parentId: string) => {
    setLoadingNodeId(parentId);

    try {
      const numericParentId = parseInt(parentId);
      if (isNaN(numericParentId)) return;

      // Load child levels
      const response = await getChildrenLevels({
        siteId: siteId.toString(),
        parentId: numericParentId
      }).unwrap();

      const activeNodes = response.filter((node: any) => !node.deletedAt);

      // If no children levels, try loading procedures
      let newChildren: TreeNode[];
      if (activeNodes.length === 0) {
        // This is a leaf level, load procedures
        const procedures = await getProceduresByLevel(parentId).unwrap();
        setSelectedLevelProcedures(prev => new Map(prev).set(parentId, procedures));
        newChildren = buildProcedureNodes(procedures);
      } else {
        // Has child levels, create nodes with placeholders
        newChildren = activeNodes.map((level: any) => ({
          id: level.id.toString(),
          name: level.name,
          type: 'level' as const,
          data: level,
          children: [{
            id: `placeholder-${level.id}`,
            name: "...",
            type: 'level' as const,
            attributes: {
              isPlaceholder: true,
              parentId: level.id.toString(),
            },
          }],
        }));
      }

      // Update tree: replace placeholder with actual children
      setTreeData(prevData => {
        const updateTree = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            // If this is the parent node, replace its children
            if (node.id === parentId) {
              return {
                ...node,
                children: newChildren,
              };
            }
            // If this node has children, recurse
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: updateTree(node.children),
              };
            }
            return node;
          });
        };

        return updateTree(prevData);
      });

      // Expand the node
      setCollapsedState(parentId, false);
    } catch (error) {
      console.error("Error loading children:", error);
      AnatomyNotification.error(notificationApi, Strings.errorLoadingData);
    } finally {
      setLoadingNodeId(null);
    }
  }, [siteId, getChildrenLevels, getProceduresByLevel, buildProcedureNodes]);

  // Load procedures for a level
  const loadProceduresForLevel = useCallback(async (levelId: string) => {
    if (selectedLevelProcedures.has(levelId)) return;

    setLoadingNodeId(levelId);

    try {
      const procedures = await getProceduresByLevel(levelId).unwrap();
      setSelectedLevelProcedures(prev => new Map(prev).set(levelId, procedures));

      const procedureNodes = buildProcedureNodes(procedures);

      // Update tree: add procedures to level
      setTreeData(prevData => {
        const updateTree = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === levelId) {
              // Keep existing level children, add procedures
              const levelChildren = (node.children || []).filter(
                child => child.type === 'level' && !child.attributes?.isPlaceholder
              );
              return {
                ...node,
                children: [...levelChildren, ...procedureNodes],
              };
            }
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: updateTree(node.children),
              };
            }
            return node;
          });
        };

        return updateTree(prevData);
      });
    } catch (error) {
      console.error("Error loading procedures:", error);
      AnatomyNotification.error(notificationApi, Strings.errorLoadingProcedures);
    } finally {
      setLoadingNodeId(null);
    }
  }, [getProceduresByLevel, selectedLevelProcedures, buildProcedureNodes]);

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

  // Handle node click
  const handleNodeClick = useCallback((nodeData: any, toggleNode: () => void) => {
    const node = nodeData as TreeNode;

    // Handle placeholder clicks
    if (node.attributes?.isPlaceholder) {
      const parentId = node.attributes.parentId;
      if (parentId) {
        loadNodeChildren(parentId);
      }
      return;
    }

    // Handle regular node toggle
    if (node.children && node.children.length > 0) {
      const newCollapsedState = !nodeData.__rd3t?.collapsed;
      setCollapsedState(node.id, newCollapsedState);
      toggleNode();

      // If expanding a level node and procedures haven't been loaded yet
      if (!newCollapsedState && node.type === 'level' && node.id !== "0") {
        const hasOnlyPlaceholder = node.children.length === 1 &&
                                   node.children[0].attributes?.isPlaceholder;
        const hasNoPlaceholderAndNoProcedures = !hasOnlyPlaceholder &&
                                                !selectedLevelProcedures.has(node.id);

        if (hasNoPlaceholderAndNoProcedures) {
          loadProceduresForLevel(node.id);
        }
      }
    }
  }, [loadNodeChildren, loadProceduresForLevel, selectedLevelProcedures]);

  // Custom node element renderer
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const node = nodeDatum as TreeNode;
    const isPlaceholder = node.attributes?.isPlaceholder;
    const isLoadingNode = loadingNodeId === node.id || loadingNodeId === node.attributes?.parentId;

    // Don't manage collapsed state for placeholders
    if (!isPlaceholder && nodeDatum.__rd3t) {
      const isCollapsed = getCollapsedState(node.id);
      nodeDatum.__rd3t.collapsed = isCollapsed;
    }

    const isLeafNode = !node.children || node.children.length === 0;
    const procedures = selectedLevelProcedures.get(node.id);
    const procedureCount = procedures ? procedures.length : 0;
    const hasLoadedProcedures = selectedLevelProcedures.has(node.id);

    // Determine fill color based on node type
    let fillColor = "#145695"; // Default blue for folders
    if (isPlaceholder) {
      fillColor = "#f0f0f0"; // Light gray for placeholders
    } else if (node.type === 'position') {
      fillColor = "#52c41a"; // Green for positions
    } else if (node.type === 'procedure') {
      fillColor = "#fa8c16"; // Orange for procedures
    } else if (node.type === 'sequence') {
      fillColor = "#722ed1"; // Purple for sequences
    } else if (isLeafNode && node.type === 'level' && hasLoadedProcedures) {
      fillColor = "#FFFF00"; // Yellow for leaf levels
    }

    // Display text with count
    let displayText = node.name;
    if (!isPlaceholder && node.type === 'level' && node.id !== "0") {
      if (hasLoadedProcedures && procedureCount > 0) {
        displayText += ` (${procedureCount})`;
      }
    } else if (node.type === 'position' && node.children) {
      displayText += ` (${node.children.length})`;
    } else if (node.type === 'procedure' && node.children) {
      displayText += ` (${node.children.length} seq.)`;
    }

    return (
      <g
        onClick={(e) => {
          e.stopPropagation();
          handleNodeClick(nodeDatum, toggleNode);
        }}
        style={{
          cursor: isLoadingNode ? 'progress' : 'pointer'
        }}
      >
        {isLoadingNode ? (
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
          <>
            <circle r={8} fill="#f0f0f0" stroke="#d9d9d9" strokeWidth={0.5} />
            <text
              fill="#999999"
              x={12}
              y={5}
              style={{ fontSize: "10px", fontStyle: "italic" }}
            >
              {displayText}
            </text>
          </>
        ) : (
          <>
            <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
            <text
              fill={token.colorText}
              strokeWidth={node.id === "0" ? "0.8" : "0"}
              x={node.id === "0" ? -300 : 20}
              y={node.id === "0" ? 0 : 20}
              style={{
                fontSize: node.id === "0" ? "16px" : "14px",
                fontWeight: node.id === "0" ? "bold" : "normal"
              }}
            >
              {displayText}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <MainContainer
      title={Strings.proceduresTreeSB}
      description={siteName || Strings.empty}
      content={
        <>
          {contextHolder}
          <div
            ref={containerRef}
            className="flex-grow border border-gray-300 shadow-md rounded-md m-4 p-4 relative overflow-hidden"
            style={{ height: "calc(100vh - 250px)" }}
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
                <Spin size="large" tip="Loading tree structure..." />
              </div>
            ) : (
              <>
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
      }
      enableSearch={false}
      enableCreateButton={false}
      isLoading={false}
    />
  );
};

export default ProceduresTreePageLazy;
