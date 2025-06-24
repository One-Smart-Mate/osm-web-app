import { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import Strings from "../../utils/localizations/Strings";
import LevelDetailsCard from "../level/components/LevelDetailsCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetlevelsMutation } from "../../services/levelService";
import { useGetCardsByLevelMutation } from "../../services/cardService";
import { Level } from "../../data/level/level";
import { Drawer, Spin, Button } from "antd";
import { useAppDispatch } from "../../core/store";
import { setSiteId } from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import Constants from "../../utils/Constants";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { theme } from "antd";

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

// Read-only Node Component
const ReadOnlyNodeElement = ({ nodeDatum, toggleNode, handleShowDetails, cardCounts = {} }: any) => {
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
  const fillColor = isLeafNode ? "#FFFF00" : "#145695";


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

  const totalCardCount = nodeDatum.id !== "0" ? calculateTotalCards(nodeDatum, cardCounts) : null;

  const displayText = nodeDatum.name + (totalCardCount && totalCardCount > 0 ? ` (${totalCardCount})` : "");

  const handleLeftClick = (e: React.MouseEvent<SVGGElement>) => {
    e.stopPropagation();
    
    // Only show details for non-root nodes
    if (nodeDatum.id !== "0") {
      handleShowDetails(nodeDatum.id);
    }
    
    // Handle node expansion/collapse
    const newCollapsedState = !nodeDatum.__rd3t.collapsed;
    setCollapsedState(nodeDatum.id, newCollapsedState);
    toggleNode();
  };

  return (
    <g onClick={handleLeftClick} style={{ cursor: "pointer" }}>
      <circle r={15} fill={fillColor} stroke="none" strokeWidth={0} />
      <text
        fill={token.colorText}
        strokeWidth={nodeDatum.id === "0" ? "0.8" : "0"}
        x={nodeDatum.id === "0" ? -200 : 20}
        y={nodeDatum.id === "0" ? 0 : 20}
        style={{ fontSize: "14px" }}
      >
        {displayText}
      </text>
    </g>
  );
};

const LevelsReadOnly = () => {
  const { isIhAdmin } = useCurrentUser();
  const [getLevels] = useGetlevelsMutation();
  const [getCardsByLevel] = useGetCardsByLevelMutation();

  const [isLoading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [levelCardCounts, setLevelCardCounts] = useState<{ [key: string]: number }>({});
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

  const handleGetLevels = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }

    setLoading(true);
    try {
      const response = await getLevels(location.state.siteId).unwrap();

      const activeNodes = response.filter((node: any) => !node.deletedAt);
      console.log(`Filtering nodes: ${response.length} total, ${activeNodes.length} active, ${response.length - activeNodes.length} deleted`);

      const hierarchyData = buildHierarchy(activeNodes);

      const isExpanded = localStorage.getItem("treeExpandedStateReadOnly") === "true";

      if (isExpanded !== undefined) {
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
      }

      // Fetch card counts for each level
      const cardCountsObj: { [key: string]: number } = {};

      const countPromises = response.map(async (level) => {
        try {
          const cards = await getCardsByLevel({
            levelId: level.id,
            siteId: location.state.siteId,
          }).unwrap();

          cardCountsObj[level.id] = cards.length;
        } catch (error) {
          console.error(`Error fetching cards for level ${level.id}:`, error);
          cardCountsObj[level.id] = 0;
        }
      });

      await Promise.all(countPromises);
      setLevelCardCounts(cardCountsObj);

      setTreeData([
        {
          name: Strings.levelsOf.concat(siteName),
          id: "0",
          children: hierarchyData,
        },
      ]);
      dispatch(setSiteId(location.state.siteId));
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      console.error("Error loading levels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (nodeId: string) => {
    if (nodeId !== "0") {
      setSelectedLevelId(nodeId);
      setDetailsVisible(true);
    }
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedLevelId(null);
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
      expandNodes(treeData);
      localStorage.setItem("treeExpandedStateReadOnly", "true");
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
      collapseNodes(treeData);
      localStorage.setItem("treeExpandedStateReadOnly", "false");
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

  return (
    <MainContainer
      title={`${Strings.levelsOf} ${siteName} (${Strings.readOnly})`}
      enableBackButton={isIhAdmin()}
      content={
        <div>
          <div
            ref={containerRef}
            className="flex-grow border border-gray-300 shadow-md rounded-md m-4 p-4 relative overflow-hidden"
            style={{ height: "calc(100vh - 6rem)" }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Expand all nodes */}
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
                      <ReadOnlyNodeElement
                        nodeDatum={rd3tProps.nodeDatum}
                        toggleNode={rd3tProps.toggleNode}
                        handleShowDetails={handleShowDetails}
                        cardCounts={levelCardCounts}
                      />
                    )}
                    collapsible={true}
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

export default LevelsReadOnly;
