import { Button, Drawer, Dropdown, Form, notification, Spin } from "antd";
import { useEffect, useRef, useState, useCallback } from "react";
import Tree from "react-d3-tree";
import { useLocation, useNavigate } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import { useGetCardTypesMutation } from "../../services/CardTypesService";
import { useGetPreclassifiersMutation } from "../../services/preclassifierService";
import { setSiteId } from "../../core/genericReducer";
import { useAppDispatch } from "../../core/store";
import { CardTypes } from "../../data/cardtypes/cardTypes";
import { isRedesign } from "../../utils/Extensions";
import CardTypeDetails from "./components/CardTypeDetails";
import PreclassifierDetails from "./components/preclassifier/PreclassifierDetails";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import RefreshButton from "../components/RefreshButton";
import CardTypeForm, { CardTypeFormType } from "./components/CardTypeForm";
import PreclassifierForm, { PreclassifierFormType } from "./components/preclassifier/PreclassifierForm";
import { theme } from "antd";
import { CardTypesCache } from "../../utils/cardTypesCache";

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

interface TreeNode {
  id: string;
  name: string;
  nodeType: "root" | "cardType" | "preclassifier";
  children: TreeNode[];
  data?: any;
  isLoading?: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  // CardType specific
  color?: string;
  status?: string;
  // Preclassifier specific
  preclassifierCode?: string;
  cardTypeId?: string;
}

const CardTypesPageOptimized = () => {
  const [getCardTypes] = useGetCardTypesMutation();
  const [getPreclassifiers] = useGetPreclassifiersMutation();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [formData, setFormData] = useState<any>(null);
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
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);

  const location = useLocation() as unknown as Location & { state: LocationState };
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
    localStorage.setItem("cardTypesTreeExpandedState", isTreeExpanded.toString());
  }, [isTreeExpanded]);

  // Load only card types initially (no preclassifiers)
  const handleLoadData = async (siteId: string) => {
    setLoading(true);
    try {
      // Try cache first
      let cardTypesResponse = await CardTypesCache.getSiteCardTypes(siteId);

      if (!cardTypesResponse) {
        cardTypesResponse = await getCardTypes(siteId).unwrap();
        await CardTypesCache.cacheSiteCardTypes(siteId, cardTypesResponse);
      }

      // Build tree without preclassifiers initially
      const hierarchy = buildInitialHierarchy(cardTypesResponse, siteId);

      setTreeData([
        {
          id: "0",
          name: `${Strings.cardType} ${location.state.siteName}`,
          nodeType: "root",
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
        description: "Error fetching data. Using cached data if available.",
        placement: "topRight",
      });
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Build initial hierarchy with just card types
  const buildInitialHierarchy = (data: CardTypes[], siteId: string): TreeNode[] => {
    return data
      .filter((ct) => `${ct.siteId}` === `${siteId}`)
      .map((cardType) => ({
        id: cardType.id,
        name: cardType.name,
        nodeType: "cardType" as const,
        children: [],
        data: cardType,
        color: cardType.color,
        status: cardType.status,
        hasChildren: true, // Assume all have preclassifiers, will be corrected on load
        isLoading: false,
        isExpanded: false,
      }));
  };

  // Load preclassifiers for a specific card type (lazy loading)
  const loadPreclassifiers = useCallback(async (cardTypeId: string): Promise<TreeNode[]> => {
    try {
      // Try cache first
      let preclassifiers = await CardTypesCache.getPreclassifiers(cardTypeId);

      if (!preclassifiers) {
        preclassifiers = await getPreclassifiers(cardTypeId).unwrap();
        await CardTypesCache.cachePreclassifiers(cardTypeId, preclassifiers);
      }

      return preclassifiers.map((pc: any) => ({
        id: pc.id,
        name: pc.preclassifierDescription,
        nodeType: "preclassifier" as const,
        children: [],
        data: pc,
        preclassifierCode: pc.preclassifierCode,
        cardTypeId: cardTypeId,
        status: pc.status,
      }));
    } catch (error) {
      console.error(`Error loading preclassifiers for card type ${cardTypeId}:`, error);
      return [];
    }
  }, [getPreclassifiers]);

  // Update a specific node in the tree
  const updateNodeInTree = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    setTreeData((prevTree) => {
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, ...updates };
          }
          if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prevTree);
    });
  }, []);

  // Toggle node expansion with lazy loading
  const handleNodeToggle = useCallback(async (nodeId: string, nodeDatum: any) => {
    if (nodeDatum.nodeType !== "cardType") return;

    const isCurrentlyExpanded = nodeDatum.__rd3t?.collapsed === false;

    if (!isCurrentlyExpanded && nodeDatum.children?.length === 0) {
      // Need to load preclassifiers
      setLoadingNodeId(nodeId);
      updateNodeInTree(nodeId, { isLoading: true });

      const preclassifiers = await loadPreclassifiers(nodeId);

      updateNodeInTree(nodeId, {
        children: preclassifiers,
        isLoading: false,
        hasChildren: preclassifiers.length > 0,
      });

      setLoadingNodeId(null);
    }
  }, [loadPreclassifiers, updateNodeInTree]);

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
          : `${data.cardTypeMethodologyName || Strings.empty} - ${data.cardTypeMethodology || Strings.empty}`;

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
        const baseDesc = stripCloneSuffix(data.preclassifierDescription || Strings.empty);
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

    if (!nodeDatum) {
      return <g></g>;
    }

    const isRoot = nodeDatum.__rd3t?.depth === 0;
    const isPreclassifier = nodeDatum.nodeType === "preclassifier";
    const isCardType = nodeDatum.nodeType === "cardType";
    const isNodeLoading = loadingNodeId === nodeDatum.id;

    const getCollapsedState = (nodeId: string): boolean => {
      if (!nodeId) return false;
      const storedState = localStorage.getItem(`node_${nodeId}_collapsed`);
      return JSON.parse(storedState ?? "false");
    };

    const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
      if (!nodeId) return;
      localStorage.setItem(`node_${nodeId}_collapsed`, isCollapsed.toString());
    };

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

    const fillColor = statusColor
      ? statusColor
      : isRoot
      ? "#145695"
      : isPreclassifier
      ? "#FFFF00"
      : isCardType && nodeDatum.color
      ? `#${nodeDatum.color}`
      : "#145695";

    const textStyles = {
      fontSize: isRoot ? "26px" : isPreclassifier ? "16px" : "20px",
      fontWeight: 300,
      fontFamily: "Arial, sans-serif",
      fill: token.colorText,
    };

    const handleEditPre = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeUpdatePreclassifier, nodeDatum);
    };

    const handleLeftClick = async (e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();
      handleShowDetails(nodeDatum);

      if (isCardType) {
        // Load preclassifiers before toggling
        await handleNodeToggle(nodeDatum.id, nodeDatum);
      }

      const newCollapsedState = !nodeDatum.__rd3t.collapsed;
      setCollapsedState(nodeDatum.id, newCollapsedState);

      toggleNode();
    };

    const handleClonePre = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeCreatePreclassifier, nodeDatum);
    };

    const preMenu = [
      {
        key: "editPre",
        label: isRedesign() ? (
          <Button type="primary" onClick={(e) => { e.stopPropagation(); handleEditPre(); }}>
            {Strings.cardTypesEditPreclassifier}
          </Button>
        ) : (
          <button
            className="w-28 bg-blue-700 text-white p-2 rounded-md text-xs"
            onClick={(e) => { e.stopPropagation(); handleEditPre(); }}
          >
            {Strings.cardTypesEditPreclassifier}
          </button>
        ),
      },
      {
        key: "clonePre",
        label: isRedesign() ? (
          <Button type="default" onClick={(e) => { e.stopPropagation(); handleClonePre(); }}>
            {Strings.cardTypesClonePreclassifier}
          </Button>
        ) : (
          <button
            className="w-28 bg-yellow-500 text-white p-2 rounded-md text-xs"
            onClick={(e) => { e.stopPropagation(); handleClonePre(); }}
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

    // Preclassifier node
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
          <text x={25} y={0} style={textStyles}>
            {nodeDatum.name}
          </text>
          {nodeDatum.preclassifierCode && (
            <text x={25} y={18} style={{ ...textStyles, fontSize: "14px", fill: "#666666" }}>
              {nodeDatum.preclassifierCode}
            </text>
          )}
        </g>
      );
    }

    // Root node
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
          <text x={-300} y={-50} style={textStyles}>
            {Strings.cardType} {location.state?.siteName || Strings.defaultSiteName}
          </text>
        </g>
      );
    }

    // Card Type node
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
          <g>
            <circle
              r={18}
              stroke="none"
              strokeWidth={0}
              fill={fillColor}
              style={{ cursor: "pointer" }}
              onClick={handleLeftClick}
            />
            {/* Loading indicator */}
            {isNodeLoading && (
              <foreignObject x={-12} y={-12} width={24} height={24}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                  <Spin size="small" />
                </div>
              </foreignObject>
            )}
          </g>
        </Dropdown>
        <text x={20} y={35} style={textStyles}>
          {nodeDatum.name}
          {isCardType && (!nodeDatum.children || nodeDatum.children.length === 0) && !isNodeLoading &&
            nodeDatum.__rd3t?.collapsed === false && " (" + Strings.noPreclassifiers + ")"}
        </text>
      </g>
    );
  };

  const expandAllNodes = async () => {
    // Load all preclassifiers first
    setLoading(true);

    try {
      const updatedTree = [...treeData];
      if (updatedTree[0]?.children) {
        for (const cardTypeNode of updatedTree[0].children) {
          if (cardTypeNode.nodeType === "cardType" && cardTypeNode.children.length === 0) {
            const preclassifiers = await loadPreclassifiers(cardTypeNode.id);
            cardTypeNode.children = preclassifiers;
            cardTypeNode.hasChildren = preclassifiers.length > 0;
          }
          localStorage.setItem(`node_${cardTypeNode.id}_collapsed`, "false");
        }
      }

      setTreeData(updatedTree);
      localStorage.setItem("cardTypesTreeExpandedState", "true");
      setIsTreeExpanded(true);

      // Force re-render by reloading
      handleLoadData(location.state.siteId);
    } catch (error) {
      console.error("Error expanding all nodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const collapseAllNodes = () => {
    if (treeData[0]?.children) {
      for (const node of treeData[0].children) {
        if (node.id) {
          localStorage.setItem(`node_${node.id}_collapsed`, "true");
        }
      }
    }

    localStorage.setItem("cardTypesTreeExpandedState", "false");
    handleLoadData(location.state.siteId);
    setIsTreeExpanded(false);
  };

  const toggleAllNodes = () => {
    if (isTreeExpanded) {
      collapseAllNodes();
    } else {
      expandAllNodes();
    }
  };

  const handleClearCache = async () => {
    await CardTypesCache.clearSiteCache(location.state.siteId);
    notification.success({
      message: "Cache Cleared",
      description: "Refreshing data...",
    });
    handleLoadData(location.state.siteId);
  };

  useEffect(() => {
    if (containerRef.current && treeData.length > 0) {
      const dimensions = containerRef.current.getBoundingClientRect();
      setTranslate({ x: dimensions.width / 2, y: dimensions.height / 3 });
    }

    const handleResize = () => {
      if (containerRef.current && treeData.length > 0) {
        const dimensions = containerRef.current.getBoundingClientRect();
        setTranslate({ x: dimensions.width / 2, y: dimensions.height / 3 });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [treeData.length]);

  const handleCompleteCardTypeForm = async () => {
    setDrawerVisible(false);
    // Clear cache to get fresh data
    await CardTypesCache.clearSiteCache(location.state.siteId);
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
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <RefreshButton
                  onRefresh={() => handleLoadData(location.state.siteId)}
                  isLoading={loading}
                />
                <Button onClick={handleClearCache} type="dashed">
                  {Strings.clearCache || "Clear Cache"}
                </Button>
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
                onComplete={handleCompleteCardTypeForm}
                formType={CardTypeFormType._CREATE}
                data={formData}
              />
            )}
            {drawerType === Strings.cardTypesDrawerTypeUpdateCardType && (
              <CardTypeForm
                onComplete={handleCompleteCardTypeForm}
                formType={CardTypeFormType._UPDATE}
                data={formData}
              />
            )}
            {drawerType === Strings.cardTypesDrawerTypeCreatePreclassifier && (
              <PreclassifierForm
                onComplete={handleCompleteCardTypeForm}
                formType={PreclassifierFormType._CREATE}
                data={formData}
              />
            )}
            {drawerType === Strings.cardTypesDrawerTypeUpdatePreclassifier && (
              <PreclassifierForm
                onComplete={handleCompleteCardTypeForm}
                formType={PreclassifierFormType._UPDATE}
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

export default CardTypesPageOptimized;
