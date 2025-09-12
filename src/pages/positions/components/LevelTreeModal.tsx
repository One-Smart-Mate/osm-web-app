import { useEffect, useState, useRef } from "react";
import { Modal, Spin, Button } from "antd";
import Tree from "react-d3-tree";
import { useGetlevelsMutation } from "../../../services/levelService";
import Strings from "../../../utils/localizations/Strings";

interface LevelTreeModalProps {
  isVisible: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
  onSelectLevel?: (_levelData: any) => void;
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
  const [getLevels] = useGetlevelsMutation();
  const [isLoading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  // State to track if the tree is fully expanded or collapsed
  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem('levelTreeModalExpandedState');
    return storedState === 'true';
  });

  useEffect(() => {
    // Update localStorage when tree expanded state changes
    localStorage.setItem('levelTreeModalExpandedState', isTreeExpanded.toString());
  }, [isTreeExpanded]);

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
      const hierarchy = buildHierarchy(response);
      
      // Get the tree expanded state from localStorage
      const isExpanded = localStorage.getItem('levelTreeModalExpandedState') === 'true';
      
      // Apply the state to all nodes if needed
      if (isExpanded !== undefined) {
        // Recursive function to set the state of all nodes
        const applyExpandState = (nodes: any[]) => {
          if (!nodes || nodes.length === 0) return;
          
          nodes.forEach(node => {
            // Skip the root node
            if (node && node.id && node.id !== "0") {
              localStorage.setItem(
                `levelTreeModal_${node.id}_collapsed`,
                (!isExpanded).toString() // false if expanded, true if collapsed
              );
            }
            
            // Process children recursively
            if (node && node.children && node.children.length > 0) {
              applyExpandState(node.children);
            }
          });
        };
        
        // Apply the state to all nodes
        applyExpandState(hierarchy);
      }
      
      setTreeData([
        {
          name: Strings.levelsOf.concat(' ', siteName),
          id: "0",
          children: hierarchy,
        },
      ]);
      
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (_error) {
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

  // Function to expand all nodes in the tree
  const expandAllNodes = () => {
    // Recursive function to expand all nodes
    const expandNodes = (nodes: any[]) => {
      if (!nodes || nodes.length === 0) return;
      
      nodes.forEach(node => {
        // Set expanded state in localStorage (false means expanded in this context)
        if (node && node.id) {
          localStorage.setItem(
            `levelTreeModal_${node.id}_collapsed`,
            'false'
          );
        }
        
        // Process children recursively
        if (node && node.children && node.children.length > 0) {
          expandNodes(node.children);
        }
      });
    };

    // Start expansion from root nodes
    if (treeData && treeData.length > 0 && treeData[0] && treeData[0].children) {
      expandNodes(treeData[0].children);
      // Save the general tree state in localStorage
      localStorage.setItem('levelTreeModalExpandedState', 'true');
      // Refresh the tree to apply changes
      handleGetLevels();
      setIsTreeExpanded(true);
    }
  };

  // Function to collapse all nodes in the tree
  const collapseAllNodes = () => {
    // Recursive function to collapse all nodes
    const collapseNodes = (nodes: any[]) => {
      if (!nodes || nodes.length === 0) return;
      
      nodes.forEach(node => {
        // Skip the root node
        if (node && node.id && node.id !== "0") {
          // Set collapsed state in localStorage (true means collapsed in this context)
          localStorage.setItem(
            `levelTreeModal_${node.id}_collapsed`,
            'true'
          );
        }
        
        // Process children recursively
        if (node && node.children && node.children.length > 0) {
          collapseNodes(node.children);
        }
      });
    };

    // Start collapsing from root nodes
    if (treeData && treeData.length > 0 && treeData[0] && treeData[0].children) {
      collapseNodes(treeData[0].children);
      // Save the general tree state in localStorage
      localStorage.setItem('levelTreeModalExpandedState', 'false');
      // Refresh the tree to apply changes
      handleGetLevels();
      setIsTreeExpanded(false);
    }
  };

  // Function to toggle between expanding and collapsing all nodes
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

    // Get collapsed state from localStorage
    const getCollapsedState = (nodeId: string): boolean => {
      if (!nodeId) return false;
      const storedState = localStorage.getItem(`levelTreeModal_${nodeId}_collapsed`);
      return storedState === 'true';
    };
    
    // Set collapsed state in localStorage
    const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
      if (!nodeId) return;
      localStorage.setItem(`levelTreeModal_${nodeId}_collapsed`, isCollapsed.toString());
    };
    
    // Apply collapsed state to the node
    if (nodeDatum.id && nodeDatum.__rd3t) {
      const isCollapsed = getCollapsedState(nodeDatum.id);
      nodeDatum.__rd3t.collapsed = isCollapsed;
    }

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
      
      // Toggle collapsed state in localStorage
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
        header: { top: 20 }
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
                  left: popoverPosition.x + 'px', 
                  top: popoverPosition.y + 'px',
                  transform: 'translate(-100%, -50%)'
                }}
              >
                <Button 
                  type="primary" 
                  onClick={handleCreatePositionHere}
                >
                  {Strings.createPositionHere}
                </Button>
              </div>
            )}
            
            <div className="absolute top-4 right-4">
              <Button 
                type="primary" 
                onClick={toggleAllNodes}
              >
                {isTreeExpanded ? Strings.collapseAll : Strings.expandAll}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default LevelTreeModal;
