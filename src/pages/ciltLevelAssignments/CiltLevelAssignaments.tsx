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
import AnatomyNotification, { AnatomyNotificationType } from "../components/AnatomyNotification";

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
  onNodeClick,
}: any) => {
  const { token } = theme.useToken();

  const isCollapsed =
    localStorage.getItem(
      `${Constants.nodeStartBridgeCollapsed}${nodeDatum.id}${Constants.nodeEndBridgeCollapserd}`
    ) === "true";

  nodeDatum.__rd3t = nodeDatum.__rd3t || {};
  nodeDatum.__rd3t.collapsed = isCollapsed;

  const isLeafNode = !nodeDatum.children || nodeDatum.children.length === 0;
  const fillColor = isLeafNode ? "#FFFF00" : "#145695";

  const handleClick = (e: React.MouseEvent) => {
    if (isLeafNode && onNodeClick) {
      onNodeClick(e, nodeDatum);
    } else {
      toggleNode();
    }
  };

  return (
    <g
      onClick={handleClick}
      onContextMenu={(e) =>
        onNodeContextMenu && onNodeContextMenu(e, nodeDatum)
      }
    >
      <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
      <text
        fill={token.colorText}
        strokeWidth={nodeDatum.id === "0" ? "0.5" : "0"}
        x={nodeDatum.id === "0" ? -200 : 20}
        y={nodeDatum.id === "0" ? 0 : 20}
        style={{ fontSize: "14px" }}
      >
        {nodeDatum.name}
      </text>
    </g>
  );
};

const CiltLevelAssignaments: React.FC = () => {
  const location = useLocation();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
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

  const handleGetLevels = async () => {
    setIsLoading(true);
    try {
      const response = await getLevels(siteId).unwrap();
      const hierarchyData = buildHierarchy(response);

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
      handleGetLevels();
      setIsTreeExpanded(true);
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

  const handleNodeContextMenu = (event: React.MouseEvent, nodeDatum: any) => {
    event.preventDefault();
    setSelectedNode(nodeDatum);
    setContextMenuVisible(true);

    setContextMenuPos({
      x: event.clientX - 250,
      y: event.clientY - 150,
    });
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
      const validatedPayload = {
        siteId: Number(payload.siteId),
        ciltMstrId: Number(payload.ciltMstrId),
        positionId: Number(payload.positionId),
        levelId: Number(payload.levelId),
        status: payload.status,
      };

      await createCiltMstrPositionLevel(validatedPayload).unwrap();
      AnatomyNotification.success(notification, AnatomyNotificationType.REGISTER);
    } catch (error) {
      console.error(Strings.oplErrorAssigning, error);

      if (error && typeof error === "object" && "data" in error) {
        console.error(Strings.oplErrorAssigning, error.data);
        AnatomyNotification.error(notification, Strings.errorOccurred);
      } else {
        AnatomyNotification.error(notification, Strings.errorOccurred);
      }
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
      AnatomyNotification.success(notification, AnatomyNotificationType.REGISTER);
    } catch (error) {
      console.error(Strings.oplErrorAssigning, error);

      if (error && typeof error === "object" && "data" in error) {
        console.error(Strings.oplErrorAssigning, error.data);
        AnatomyNotification.error(notification, Strings.oplErrorAssigning);
      } else {
        AnatomyNotification.error(notification, Strings.oplErrorAssigning);
      }
    } finally {
      setIsAssigning(false);
      setIsDrawerVisible(false);
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
