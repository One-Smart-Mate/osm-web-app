import { Button, Drawer, Dropdown, Form, notification } from "antd";
import { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import { useLocation, useNavigate } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import {
  useGetCardTypesMutation,
} from "../../services/CardTypesService";
import {
  useGetPreclassifiersMutation,
} from "../../services/preclassifierService";
import { setSiteId } from "../../core/genericReducer";
import { useAppDispatch } from "../../core/store";
import { CardTypes } from "../../data/cardtypes/cardTypes";
import { isRedesign } from "../../utils/Extensions";
import CardTypeDetails from "./components/CardTypeDetails";
import PreclassifierDetails from "./components/preclassifier/PreclassifierDetails";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import CardTypeForm, { CardTypeFormType } from "./components/CardTypeForm";
import PreclassifierForm, {
  PreclassifierFormType,
} from "./components/preclassifier/PreclassifierForm";
import { theme } from 'antd';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface LocationState {
  siteId: string;
  siteName: string;
}

type DrawerType =
  | typeof Strings.cardTypesDrawerTypeCreateCardType
  | typeof Strings.cardTypesDrawerTypeUpdateCardType
  | typeof Strings.cardTypesDrawerTypeCreatePreclassifier
  | typeof Strings.cardTypesDrawerTypeUpdatePreclassifier
  | null;

const buildHierarchy = (
  data: CardTypes[],
  siteId: string,
  preclassifiersMap: { [cardTypeId: string]: any[] }
) => {
  const map: { [key: string]: any } = {};
  const tree: any[] = [];

  data.forEach((node) => {
    map[node.id] = {
      ...node,
      name: node.name,
      nodeType: "cardType",
      children: [],
      collapsed: false,
    };
    const preclassifiers = preclassifiersMap[node.id] || [];
    if (preclassifiers.length > 0) {
      map[node.id].children = preclassifiers.map((pc) => ({
        ...pc,
        name: pc.preclassifierDescription,
        nodeType: "preclassifier",
        cardTypeId: pc.cardTypeId,
        children: [],
      }));
    }
  });

  data.forEach((node) => {
    if (`${node.siteId}` === `${siteId}`) {
      tree.push(map[node.id]);
    } else if (map[node.siteId]) {
      map[node.siteId].children.push(map[node.id]);
    }
  });

  return tree;
};

const CardTypesPage = () => {
  const [getCardTypes] = useGetCardTypesMutation();
  const [getPreclassifiers] = useGetPreclassifiersMutation();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [formData, setFormData] = useState<any>(null);
  // State to track if the tree is fully expanded or collapsed
  const [isTreeExpanded, setIsTreeExpanded] = useState(() => {
    const storedState = localStorage.getItem("cardTypesTreeExpandedState");
    return storedState === "true";
  });

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsNode, setDetailsNode] = useState<any>(null);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [createPreForm] = Form.useForm();
  const [updatePreForm] = Form.useForm();
  const { isIhAdmin } = useCurrentUser();

  const [rootMenuVisible, setRootMenuVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const location = useLocation() as unknown as Location & {
    state: LocationState;
  };
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeRef = useRef<any>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { token } = theme.useToken();

  const stripCloneSuffix = (original: string) => {
    return original.replace(/\(Clone.*\)$/i, Strings.empty).trim();
  };


  useEffect(() => {
    const handleClickOutside = () => {
      setRootMenuVisible(false);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location?.state?.siteId) {
      handleLoadData(location.state.siteId);
    } else {
      navigate("/unauthorized");
    }
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem(
      "cardTypesTreeExpandedState",
      isTreeExpanded.toString()
    );
  }, [isTreeExpanded]);

  const handleLoadData = async (siteId: string) => {
    setLoading(true);
    try {
      const cardTypesResponse = await getCardTypes(siteId).unwrap();

      const promises = cardTypesResponse.map(async (ct) => {
        const preclassResp = await getPreclassifiers(String(ct.id)).unwrap();
        return { cardTypeId: ct.id, preclassifiers: preclassResp };
      });

      const results = await Promise.all(promises);
      const preclassMap: { [key: string]: any[] } = {};

      results.forEach((r) => {
        preclassMap[r.cardTypeId] = r.preclassifiers;
      });

      const hierarchy = buildHierarchy(cardTypesResponse, siteId, preclassMap);

      // Get the tree expanded state from localStorage
      const isExpanded =
        localStorage.getItem("cardTypesTreeExpandedState") === "true";

      // Apply the state to all nodes if needed
      if (isExpanded !== undefined) {
        // Recursive function to set the state of all nodes
        const applyExpandState = (nodes: any[]) => {
          nodes.forEach((node) => {
            // Skip the root node
            if (node.id) {
              localStorage.setItem(
                `node_${node.id}_collapsed`,
                (!isExpanded).toString() // false if expanded, true if collapsed
              );
            }

            // Process children recursively
            if (node.children && node.children.length > 0) {
              applyExpandState(node.children);
            }
          });
        };

        // Apply the state to all nodes
        applyExpandState(hierarchy);
      }

      setTreeData([
        {
          name: `${Strings.cardType} ${location.state.siteName}`,
          nodeType: "cardType",
          id: "0",
          children: hierarchy,
        },
      ]);

      dispatch(setSiteId(siteId));

      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (err) {
      console.error(Strings.cardTypesErrorFetchingData, err);
      notification.error({
        message: "Error",
        description: "Error fetching data",
        placement: "topRight",
      });
      // Set empty tree data on error
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setDrawerType(null);
    setFormData(null);

    createForm.resetFields();
    updateForm.resetFields();
    createPreForm.resetFields();
    updatePreForm.resetFields();
  };

  const handleDrawerOpen = (type: DrawerType, data: any = null) => {
    setDrawerType(type);
    setDrawerVisible(true);

    let nextFormData: any = data || {};

    if (type === Strings.cardTypesDrawerTypeCreateCardType && data) {
      const baseName = stripCloneSuffix(data.name);
      const formattedMethodology =
        typeof data.cardTypeMethodology === "string"
          ? data.cardTypeMethodology
          : `${data.cardTypeMethodologyName || Strings.empty} - ${
              data.cardTypeMethodology || Strings.empty
            }`;

      nextFormData = {
        ...data,
        cardTypeMethodology: formattedMethodology,
        name: `${baseName} ${Strings.cardTypesCloneSuffix}`,
      };
    }

    if (type === Strings.cardTypesDrawerTypeCreateCardType && !data) {
      nextFormData = {};
    }

    if (type === Strings.cardTypesDrawerTypeCreatePreclassifier && data) {
      if (data.preclassifierCode) {
        const baseDesc = stripCloneSuffix(
          data.preclassifierDescription || Strings.empty
        );
        nextFormData = {
          ...data,
          code: data.preclassifierCode,
          description: `${baseDesc} ${Strings.cardTypesCloneSuffix}`,
          cardTypeId: data.cardTypeId,
        };
      } else {
        nextFormData = {
          ...data,
          code: Strings.empty,
          description: Strings.empty,
          cardTypeId: data.cardTypeId,
        };
      }
    }

    setFormData(nextFormData);
  };

  const handleShowDetails = (node: any) => {
    setDetailsNode(node);
    setDetailsVisible(true);
  };
  const renderCustomNodeElement = (rd3tProps: any) => {
    const { nodeDatum, toggleNode } = rd3tProps;

    // Safety check to ensure nodeDatum exists and has the expected properties
    if (!nodeDatum) {
      return <g></g>; // Return empty group if nodeDatum is undefined
    }

    const isRoot = nodeDatum.__rd3t?.depth === 0;
    const isPreclassifier = nodeDatum.nodeType === "preclassifier";

    const getCollapsedState = (nodeId: string): boolean => {
      if (!nodeId) return false;
      const storedState: string | null = localStorage.getItem(
        `node_${nodeId}_collapsed`
      );
      const booleanState: boolean = JSON.parse(storedState ?? Strings.false); // Parse the state
      return booleanState;
    };

    const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
      if (!nodeId) return;
      localStorage.setItem(`node_${nodeId}_collapsed`, isCollapsed.toString());
    };

    // Only attempt to get/set collapsed state if nodeDatum has an id
    if (nodeDatum.id && nodeDatum.__rd3t) {
      const isCollapsed = getCollapsedState(nodeDatum.id);
      nodeDatum.__rd3t.collapsed = isCollapsed;
    }

    const getStatusColor = (status: string | undefined) => {
      switch (status) {
        case Strings.detailsOptionS:
          return "#999999";
        case Strings.detailsOptionC:
          return "#383838";
        default:
          return null;
      }
    };

    const statusColor = getStatusColor(nodeDatum.status);
    
    // Get color for node based on status, type, or card type's custom color
    const fillColor = statusColor
      ? statusColor
      : nodeDatum.__rd3t?.depth === 0
      ? "#145695"
      : nodeDatum.nodeType === "preclassifier"
      ? "#FFFF00"
      : nodeDatum.nodeType === "cardType" && nodeDatum.color
      ? `#${nodeDatum.color}` // Add # prefix if needed
      : "#145695";

    const textStyles = {
      fontSize: isRoot ? "26px" : isPreclassifier ? "16px" : "20px",
      fontWeight: 300,
      fontFamily: "Arial, sans-serif",
      fill: token.colorText,
    };

    const handleEditPre = () => {
      handleDrawerOpen(
        Strings.cardTypesDrawerTypeUpdatePreclassifier,
        nodeDatum
      );
    };

    const handleLeftClick = (e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();
      handleShowDetails(nodeDatum);

      const newCollapsedState = !nodeDatum.__rd3t.collapsed;
      setCollapsedState(nodeDatum.id, newCollapsedState);

      toggleNode();
    };

    const handleClonePre = () => {
      handleDrawerOpen(
        Strings.cardTypesDrawerTypeCreatePreclassifier,
        nodeDatum
      );
    };

    const preMenu = [
      {
        key: "editPre",
        label: isRedesign() ? (
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPre();
            }}
          >
            {Strings.cardTypesEditPreclassifier}
          </Button>
        ) : (
          <button
            className="w-28 bg-blue-700 text-white p-2 rounded-md text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPre();
            }}
          >
            {Strings.cardTypesEditPreclassifier}
          </button>
        ),
      },
      {
        key: "clonePre",
        label: isRedesign() ? (
          <Button
            type="default"
            onClick={(e) => {
              e.stopPropagation();
              handleClonePre();
            }}
          >
            {Strings.cardTypesClonePreclassifier}
          </Button>
        ) : (
          <button
            className="w-28 bg-yellow-500 text-white p-2 rounded-md text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleClonePre();
            }}
          >
            {Strings.cardTypesClonePreclassifier}
          </button>
        ),
      },
    ];

    const handleCreateCardType = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeCreateCardType);
    };
    const rootMenu = [
      {
        key: "createCT",
        label: (
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              setRootMenuVisible(false);
              handleCreateCardType();
            }}
          >
            {Strings.cardTypesCreate}
          </Button>
        ),
      },
    ];

    const handleEditCT = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeUpdateCardType, nodeDatum);
    };
    const handleCloneCT = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeCreateCardType, nodeDatum);
    };
    const handleCreatePre = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeCreatePreclassifier, {
        cardTypeId: nodeDatum.id,
      });
    };
    const ctMenu = [
      {
        key: Strings.cardTypesOptionEdit,
        label: <Button type="primary">{Strings.cardTypesEdit}</Button>,
        onClick: handleEditCT,
      },
      {
        key: Strings.cardTypesOptionClone,
        label: <Button type="default">{Strings.cardTypesCloneCardType}</Button>,
        onClick: handleCloneCT,
      },
      {
        key: Strings.cardTypesOptionCreate,
        label: (
          <Button type="link" variant="dashed">
            {Strings.cardTypesCreatePreclassifier}
          </Button>
        ),
        onClick: handleCreatePre,
      },
    ];

    if (isPreclassifier) {
      return (
        <g>
          <Dropdown
            menu={{ items: preMenu }}
            trigger={["contextMenu"]}
            onOpenChange={(open) => {
              if (open && drawerVisible) {
                setDrawerVisible(false);
              }
            }}
          >
            <circle
              r={18}
              fill={fillColor}
              stroke="none"
              strokeWidth={0}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                setRootMenuVisible(false);
                handleShowDetails(nodeDatum);
              }}
            />
          </Dropdown>
          <text x={25} y={5} style={textStyles}>
            {nodeDatum.name}
          </text>
        </g>
      );
    }

    if (isRoot) {
      return (
        <g>
          <Dropdown
            menu={{ items: rootMenu }}
            trigger={["contextMenu"]}
            open={rootMenuVisible}
            onOpenChange={(open) => setRootMenuVisible(open)}
          >
            <circle
              r={22}
              fill={fillColor}
              style={{ cursor: "pointer" }}
              stroke="none"
              strokeWidth={0}
              onClick={handleLeftClick}
            />
          </Dropdown>
          <text
            x={-300}
            y={-50}
            style={textStyles}
          >
            {Strings.cardType}{" "}
            {location.state?.siteName || Strings.defaultSiteName}
          </text>
        </g>
      );
    }

    return (
      <g>
        <Dropdown
          menu={{ items: ctMenu }}
          trigger={["contextMenu"]}
          onOpenChange={(open) => {
            if (open && drawerVisible) {
              setDrawerVisible(false);
            }
          }}
        >
          <circle
            r={18}
            stroke="none"
            strokeWidth={0}
            fill={fillColor}
            style={{ cursor: "pointer" }}
            onClick={handleLeftClick}
          />
        </Dropdown>
        <text x={20} y={35} style={textStyles}>
          {nodeDatum.name}
          {nodeDatum.nodeType === "cardType" && (!nodeDatum.children || nodeDatum.children.length === 0) && " (" + Strings.noPreclassifiers + ")"}
        </text>
      </g>
    );
  };

  const expandAllNodes = () => {
    // Recursive function to expand all nodes
    const expandNodes = (nodes: any[]) => {
      if (!nodes || nodes.length === 0) return;

      nodes.forEach((node) => {
        // Set expanded state in localStorage (false means expanded in this context)
        if (node && node.id) {
          localStorage.setItem(`node_${node.id}_collapsed`, "false");
        }

        // Process children recursively
        if (node && node.children && node.children.length > 0) {
          expandNodes(node.children);
        }
      });
    };

    // Start expansion from root nodes
    if (
      treeData &&
      treeData.length > 0 &&
      treeData[0] &&
      treeData[0].children
    ) {
      expandNodes(treeData[0].children);
      // Save the general tree state in localStorage
      localStorage.setItem("cardTypesTreeExpandedState", "true");
      // Refresh the tree to apply changes
      handleLoadData(location.state.siteId);
      setIsTreeExpanded(true);
    }
  };

  const collapseAllNodes = () => {
    // Recursive function to collapse all nodes
    const collapseNodes = (nodes: any[]) => {
      if (!nodes || nodes.length === 0) return;

      nodes.forEach((node) => {
        // Skip the root node
        if (node && node.id) {
          // Set collapsed state in localStorage (true means collapsed in this context)
          localStorage.setItem(`node_${node.id}_collapsed`, "true");
        }

        // Process children recursively
        if (node && node.children && node.children.length > 0) {
          collapseNodes(node.children);
        }
      });
    };

    // Start collapsing from root nodes
    if (
      treeData &&
      treeData.length > 0 &&
      treeData[0] &&
      treeData[0].children
    ) {
      collapseNodes(treeData[0].children);
      // Save the general tree state in localStorage
      localStorage.setItem("cardTypesTreeExpandedState", "false");
      // Refresh the tree to apply changes
      handleLoadData(location.state.siteId);
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
  
  // Center the tree when data changes or on window resize
  useEffect(() => {
    // Initial centering
    if (containerRef.current && treeData.length > 0) {
      const dimensions = containerRef.current.getBoundingClientRect();
      setTranslate({ 
        x: dimensions.width / 2, 
        y: dimensions.height / 3 
      });
    }
    
    const handleResize = () => {
      if (containerRef.current && treeData.length > 0) {
        const dimensions = containerRef.current.getBoundingClientRect();
        setTranslate({ 
          x: dimensions.width / 2, 
          y: dimensions.height / 3 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [treeData.length]); // Only depend on treeData.length

  const handleCompleteCardTypeForm = async () => {
    setDrawerVisible(false);
    handleLoadData(location.state.siteId);
  };

  return (
    <MainContainer
      title=""
      isLoading={loading}
      enableBackButton={isIhAdmin()}
      content={
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ height: window.screen.availHeight * 0.8 }}
        >
          <div ref={containerRef} className="relative flex-1 overflow-hidden">
            <>
              {/* Toggle expand/collapse button */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  onClick={toggleAllNodes}
                  type={isTreeExpanded ? "primary" : "default"}
                >
                  {isTreeExpanded ? Strings.collapseAll : Strings.expandAll}
                </Button>
              </div>

              {treeData && treeData.length > 0 && (
                <Tree
                  ref={treeRef}
                  data={treeData}
                  translate={translate}
                  orientation="horizontal"
                  renderCustomNodeElement={renderCustomNodeElement}
                  collapsible={true}
                  zoomable
                  nodeSize={{ x: 200, y: 80 }} 
                  separation={{ siblings: 1, nonSiblings: 1.2 }} 
                />
              )}
            </>
          </div>

          <Drawer
            title={
              drawerType === Strings.cardTypesDrawerTypeCreateCardType
                ? formData?.name?.includes(Strings.cardTypesCloneSuffix)
                  ? Strings.cardTypesCloneCardType
                  : Strings.cardTypesCreateCardType
                : drawerType === Strings.cardTypesDrawerTypeUpdateCardType
                ? Strings.cardTypesUpdateCardType
                : drawerType === Strings.cardTypesDrawerTypeCreatePreclassifier
                ? formData?.description?.includes(Strings.cardTypesCloneSuffix)
                  ? Strings.cardTypesClonePreclassifier
                  : Strings.cardTypesCreatePreclassifier
                : drawerType === Strings.cardTypesDrawerTypeUpdatePreclassifier
                ? Strings.cardTypesUpdatePreclassifier
                : Strings.empty
            }
            placement={isMobile ? "bottom" : "right"}
            width={isMobile ? "100%" : 400}
            onClose={handleDrawerClose}
            open={drawerVisible}
            destroyOnHidden
            mask={false}
            className="pr-5"
          >
            {drawerType === Strings.cardTypesDrawerTypeCreateCardType && (
              <CardTypeForm
                onComplete={() => {
                  handleCompleteCardTypeForm();
                }}
                formType={CardTypeFormType.CREATE}
                data={formData}
              />
            )}
            {drawerType === Strings.cardTypesDrawerTypeUpdateCardType && (
              <CardTypeForm
                onComplete={() => {
                  handleCompleteCardTypeForm();
                }}
                formType={CardTypeFormType.UPDATE}
                data={formData}
              />
            )}
            {drawerType === Strings.cardTypesDrawerTypeCreatePreclassifier && (
              <PreclassifierForm
                onComplete={() => {
                  handleCompleteCardTypeForm();
                }}
                formType={PreclassifierFormType.CREATE}
                data={formData}
              />
            )}
            {drawerType === Strings.cardTypesDrawerTypeUpdatePreclassifier && (
              <PreclassifierForm
                onComplete={() => {
                  handleCompleteCardTypeForm();
                }}
                formType={PreclassifierFormType.UPDATE}
                data={formData}
              />
            )}
          </Drawer>
          <Drawer
            title={Strings.details}
            placement={isMobile ? "bottom" : "right"}
            width={isMobile ? "100%" : 400}
            onClose={() => setDetailsVisible(false)}
            open={detailsVisible}
            destroyOnHidden
            mask={false}
          >
            {detailsNode && detailsNode.nodeType === "cardType" && (
              <CardTypeDetails nodeData={detailsNode} />
            )}
            {detailsNode && detailsNode.nodeType === "preclassifier" && (
              <PreclassifierDetails nodeData={detailsNode} />
            )}
          </Drawer>
        </div>
      }
    />
  );
};

export default CardTypesPage;
