import { useEffect, useState, useRef } from "react";
import { Modal, Spin, Button } from "antd";
import Tree from "react-d3-tree";
import { useGetlevelsMutation } from "../../../services/levelService";
import Strings from "../../../utils/localizations/Strings";
import { useTranslation } from "react-i18next";

interface LevelTreeModalProps {
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

const LevelTreeModal: React.FC<LevelTreeModalProps> = ({
  isVisible,
  onClose,
  siteId,
  siteName,
  onSelectLevel,
}) => {
  const { t } = useTranslation();
  const [getLevels] = useGetlevelsMutation();
  const [isLoading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible && siteId) {
      handleGetLevels();
    } else {
      // Reset state when modal closes
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
      setTreeData([
        {
          name: t(Strings.levelsOf).concat(' ', siteName),
          id: "0",
          children: buildHierarchy(response),
        },
      ]);
      
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      // Error handling without logging
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePositionHere = () => {
    // Handle position creation with selected node data
    if (onSelectLevel && selectedNode) {
      onSelectLevel(selectedNode);
    }
    
    setPopoverVisible(false);
    onClose();
  };

  const CustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const isLeafNode = !nodeDatum.children || nodeDatum.children.length === 0;
    const fillColor = isLeafNode ? "#FFFF00" : "#145695";

    const handleRightClick = (e: React.MouseEvent<SVGGElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get position for popover
      if (containerRef.current) {
        const rect = (e.target as SVGElement).getBoundingClientRect();
        setPopoverPosition({
          x: rect.right,
          y: rect.top
        });
      }
      
      setSelectedNode(nodeDatum);
      setPopoverVisible(true);
    };

    const handleLeftClick = (e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();
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
      title={`${t(Strings.levelsOf)} ${siteName}`}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ height: "80vh", padding: "12px" }}
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
                  left: popoverPosition.x + 'px', 
                  top: popoverPosition.y + 'px',
                  transform: 'translate(-100%, -50%)'
                }}
              >
                <Button 
                  type="primary" 
                  onClick={handleCreatePositionHere}
                >
                  {t(Strings.createPositionHere)}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default LevelTreeModal;
