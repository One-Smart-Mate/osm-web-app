import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Spin, theme } from 'antd';
import Tree from 'react-d3-tree';
import Strings from '../../utils/localizations/Strings';
import MainContainer from '../layouts/MainContainer';
import Constants from '../../utils/Constants';
import { useGetlevelsMutation } from '../../services/levelService';
import { Level } from '../../data/level/level';

// Helper function to build the hierarchy from flat data
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

// Custom Node component for the tree
const CustomNode = ({ nodeDatum, toggleNode }: any) => {
  const { token } = theme.useToken();
  
  const isCollapsed = localStorage.getItem(
    `${Constants.nodeStartBridgeCollapsed}${nodeDatum.id}${Constants.nodeEndBridgeCollapserd}`
  ) === "true";
  
  nodeDatum.__rd3t = nodeDatum.__rd3t || {};
  nodeDatum.__rd3t.collapsed = isCollapsed;

  const isLeafNode = !nodeDatum.children || nodeDatum.children.length === 0;
  const fillColor = isLeafNode ? "#FFFF00" : "#145695";

  return (
    <g onClick={toggleNode}>
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
  const [getLevels] = useGetlevelsMutation();
  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem('treeExpandedState');
    return storedState === 'true';
  });

  const siteName = location.state?.siteName || "Default Site";
  const siteId = location.state?.siteId || "1"; // Default to 1 for demo purposes
  
  useEffect(() => {
    handleGetLevels();
  }, []);

  useEffect(() => {
    localStorage.setItem('treeExpandedState', isTreeExpanded.toString());
  }, [isTreeExpanded]);

  const handleGetLevels = async () => {
    setIsLoading(true);
    try {
      const response = await getLevels(siteId).unwrap();
      const hierarchyData = buildHierarchy(response);
      
      const isExpanded = localStorage.getItem('treeExpandedState') === 'true';
      
      // Apply expand/collapse state to all nodes
      const applyExpandState = (nodes: any[]) => {
        nodes.forEach(node => {
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
      
      // Center the tree in the container
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setIsLoading(false);
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

  // Content to display in the MainContainer
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
                  />
                )}
                collapsible={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <MainContainer
      title={Strings.ciltLevelAssignments}
      content={content}
      enableSearch={false}
    />
  );
};

export default CiltLevelAssignaments;
