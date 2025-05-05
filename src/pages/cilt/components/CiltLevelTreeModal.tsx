import { useEffect, useState, useRef } from "react";
import { Modal, Spin, Button } from "antd";
import Tree from "react-d3-tree";
import { useGetlevelsMutation } from "../../../services/levelService";
import Strings from "../../../utils/localizations/Strings";

interface CiltLevelTreeModalProps {
  isVisible: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
  onSelectLevel?: (levelData: any) => void;
}

interface Level {
  id: string;
  name: string;
  superiorId: string;
  [key: string]: any;
}

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

const CiltLevelTreeModal: React.FC<CiltLevelTreeModalProps> = ({
  isVisible,
  onClose,
  siteId,
  siteName,
  onSelectLevel,
}) => {
  const [getLevels] = useGetlevelsMutation();
  const [isLoading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem("ciltLevelTreeModalExpandedState");
    return storedState === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "ciltLevelTreeModalExpandedState",
      isTreeExpanded.toString()
    );
  }, [isTreeExpanded]);

  useEffect(() => {
    if (isVisible && siteId) {
      handleGetLevels();
    } else {
      setSelectedNode(null);
      setPopoverVisible(false);
    }
  }, [isVisible, siteId]);

  useEffect(() => {
    const updateTranslate = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    };

    updateTranslate();
    window.addEventListener("resize", updateTranslate);
    return () => {
      window.removeEventListener("resize", updateTranslate);
    };
  }, [isVisible]);

  const handleGetLevels = async () => {
    if (!siteId) return;

    setLoading(true);
    try {
      const response = await getLevels(siteId).unwrap();
      const hierarchy = buildHierarchy(response);

      const isExpanded =
        localStorage.getItem("ciltLevelTreeModalExpandedState") === "true";

      if (isExpanded !== undefined) {
        const applyExpandState = (nodes: any[]) => {
          if (!nodes || nodes.length === 0) return;

          nodes.forEach((node) => {
            if (node && node.id && node.id !== "0") {
              localStorage.setItem(
                `ciltLevelTreeModal_${node.id}_collapsed`,
                (!isExpanded).toString()
              );
            }

            if (node && node.children && node.children.length > 0) {
              applyExpandState(node.children);
            }
          });
        };

        applyExpandState(hierarchy);
      }

      setTreeData([
        {
          name: Strings.levelsOf.concat(" ", siteName),
          id: "0",
          children: hierarchy,
        },
      ]);

      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSequenceHere = () => {
    if (onSelectLevel && selectedNode) {
      onSelectLevel(selectedNode);
    }

    setPopoverVisible(false);
    onClose();
  };

  const expandAllNodes = () => {
    const expandNodes = (nodes: any[]) => {
      if (!nodes || nodes.length === 0) return;

      nodes.forEach((node) => {
        if (node && node.id) {
          localStorage.setItem(
            `ciltLevelTreeModal_${node.id}_collapsed`,
            "false"
          );
        }

        if (node && node.children && node.children.length > 0) {
          expandNodes(node.children);
        }
      });
    };

    if (
      treeData &&
      treeData.length > 0 &&
      treeData[0] &&
      treeData[0].children
    ) {
      expandNodes(treeData[0].children);

      localStorage.setItem("ciltLevelTreeModalExpandedState", "true");

      handleGetLevels();
      setIsTreeExpanded(true);
    }
  };

  const collapseAllNodes = () => {
    const collapseNodes = (nodes: any[]) => {
      if (!nodes || nodes.length === 0) return;

      nodes.forEach((node) => {
        if (node && node.id && node.id !== "0") {
          localStorage.setItem(
            `ciltLevelTreeModal_${node.id}_collapsed`,
            "true"
          );
        }

        if (node && node.children && node.children.length > 0) {
          collapseNodes(node.children);
        }
      });
    };

    if (
      treeData &&
      treeData.length > 0 &&
      treeData[0] &&
      treeData[0].children
    ) {
      collapseNodes(treeData[0].children);

      localStorage.setItem("ciltLevelTreeModalExpandedState", "false");

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

  const CustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const isLeafNode = !nodeDatum.children || nodeDatum.children.length === 0;
    const fillColor = isLeafNode ? "#FFFF00" : "#145695";

    const getCollapsedState = (nodeId: string): boolean => {
      if (!nodeId) return false;
      const storedState = localStorage.getItem(
        `ciltLevelTreeModal_${nodeId}_collapsed`
      );
      return storedState === "true";
    };

    const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
      if (!nodeId) return;
      localStorage.setItem(
        `ciltLevelTreeModal_${nodeId}_collapsed`,
        isCollapsed.toString()
      );
    };

    if (nodeDatum.id && nodeDatum.__rd3t) {
      const isCollapsed = getCollapsedState(nodeDatum.id);
      nodeDatum.__rd3t.collapsed = isCollapsed;
    }

    const handleRightClick = (e: React.MouseEvent<SVGGElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (containerRef.current) {
        const rect = (e.target as SVGElement).getBoundingClientRect();
        setPopoverPosition({
          x: rect.right,
          y: rect.top,
        });
      }

      setSelectedNode(nodeDatum);
      setPopoverVisible(true);
    };

    const handleLeftClick = (e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();

      if (nodeDatum.id) {
        const newCollapsedState = !nodeDatum.__rd3t.collapsed;
        setCollapsedState(nodeDatum.id, newCollapsedState);
      }

      toggleNode();
    };

    return (
      <g onClick={handleLeftClick} onContextMenu={handleRightClick}>
        <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
        <text
          fill="black"
          strokeWidth={nodeDatum.id === "0" ? "0.8" : "0"}
          x={nodeDatum.id === "0" ? -200 : 20}
          y={nodeDatum.id === "0" ? 0 : 20}
          style={{ fontSize: "14px" }}
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <Modal
      title={`${Strings.levelsOf} ${siteName}`}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width="90%"
      styles={{
        body: { height: "80vh", padding: "12px" },
        header: { top: 20 },
      }}
    >
      <div
        ref={containerRef}
        className="h-full bg-white border border-gray-300 shadow-md rounded-md p-4 relative overflow-hidden"
        onClick={() => setPopoverVisible(false)}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {treeData.length > 0 && (
              <Tree
                data={treeData}
                orientation="horizontal"
                translate={translate}
                renderCustomNodeElement={(rd3tProps) => (
                  <CustomNodeElement
                    nodeDatum={rd3tProps.nodeDatum}
                    toggleNode={rd3tProps.toggleNode}
                  />
                )}
                collapsible={true}
              />
            )}

            {popoverVisible && selectedNode && (
              <div
                className="absolute bg-white border border-gray-200 shadow-lg rounded-md p-2 z-50"
                style={{
                  left: popoverPosition.x + "px",
                  top: popoverPosition.y + "px",
                  transform: "translate(-100%, -50%)",
                }}
              >
                <Button type="primary" onClick={handleCreateSequenceHere}>
                  {Strings.ciltLevelTreeModalCreateSequenceHere}
                </Button>
              </div>
            )}

            <div className="absolute top-4 right-4">
              <Button type="primary" onClick={toggleAllNodes}>
                {isTreeExpanded ? Strings.collapseAll : Strings.expandAll}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CiltLevelTreeModal;
