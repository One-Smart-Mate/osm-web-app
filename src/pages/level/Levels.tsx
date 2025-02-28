import { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import Strings from "../../utils/localizations/Strings";
import LevelDetails from "./components/LevelDetails";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useCreateLevelMutation,
  useGetlevelsMutation,
  useUdpateLevelMutation,
} from "../../services/levelService";
import { Level } from "../../data/level/level";
import { Form, Button, Drawer, Spin } from "antd";
import RegisterLevelForm from "./components/RegisterLevelForm";
import UpdateLevelForm from "./components/UpdateLevelForm";
import { useAppDispatch } from "../../core/store";
import { setSiteId } from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import { CreateNode } from "../../data/level/level.request";
import { UserRoles } from "../../utils/Extensions";
import Constants from "../../utils/Constants";
import { notification } from "antd";

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

const isLeafNode = (node: any) => !node.children || node.children.length === 0;

interface Props {
  role: UserRoles;
}

const Levels = ({ role }: Props) => {
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [getLevels] = useGetlevelsMutation();
  const [createLevel] = useCreateLevelMutation();
  const [updateLevel] = useUdpateLevelMutation();

  const [isLoading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const [isCloning, setIsCloning] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<"create" | "update" | null>(
    null
  );
  const [formData, setFormData] = useState<any>({});

  const [drawerPlacement, setDrawerPlacement] = useState<"right" | "bottom">(
    "right"
  );

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const siteName = location.state?.siteName || Strings.defaultSiteName;
  const siteId = location.state?.siteId;

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

  const handleGetLevels = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    try {
      const response = await getLevels(location.state.siteId).unwrap();
      setTreeData([
        {
          name: Strings.levelsOf.concat(siteName),
          id: "0",
          children: buildHierarchy(response),
        },
      ]);
      dispatch(setSiteId(location.state.siteId));
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      console.error(Strings.errorFetchingLevels);
      notification.error({
        message: "Fetching Error",
        description: "There was an error while fetching levels. Please try again later.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeAllDrawers = () => {
    setDetailsVisible(false);
    setDrawerVisible(false);
  };

  const handleCreateLevel = () => {
    closeAllDrawers();
    const supId = selectedNode?.data?.id;
    if (supId === "0") {
      createForm.setFieldsValue({ superiorId: null });
    } else if (!supId) {
      return;
    } else {
      createForm.setFieldsValue({ superiorId: supId });
    }
    setDrawerType("create");
    setDrawerVisible(true);
    setContextMenuVisible(false);
  };

  const handleUpdateLevel = () => {
    closeAllDrawers();
    setDrawerType("update");
    updateForm.resetFields();
    if (selectedNode?.data) {
      updateForm.setFieldsValue(selectedNode.data);
    }
    setFormData(selectedNode?.data || {});
    setDrawerVisible(true);
    setContextMenuVisible(false);
  };

  const cloneSubtree = async (
    node: any,
    newSuperiorId: number | null = null,
    isRoot: boolean = false
  ): Promise<Level> => {
    const allowedProperties = [
      Constants.responsibleId,
      Constants.siteId,
      Constants.superiorId,
      Constants.name,
      Constants.description,
      Constants.levelMachineId,
      Constants.notify,
    ];
    const payload = allowedProperties.reduce((acc: any, key: string) => {
      if (node[key] !== undefined) {
        if ([Constants.responsibleId, Constants.siteId, Constants.superiorId, Constants.notify].includes(key)) {
          acc[key] = node[key] !== null ? Number(node[key]) : node[key];
        } else {
          acc[key] = node[key];
        }
      }
      return acc;
    }, {});
    if (!payload.siteId && location.state?.siteId) {
      payload.siteId = Number(location.state.siteId);
    }
    payload.superiorId =
      newSuperiorId !== null
        ? newSuperiorId
        : payload.superiorId !== undefined
        ? Number(payload.superiorId)
        : 0;
    if (payload.levelMachineId && payload.levelMachineId.trim() !== Strings.empty) {
      payload.levelMachineId = `${payload.levelMachineId}${Constants.cloneBridge}${node.id}`;
    } else {
      payload.levelMachineId = null;
    }

    payload.name = isRoot ? `${node.name} ${Strings.copy}` : node.name;
    const newNodeData = await createLevel(payload).unwrap();
    const parentId = Number(newNodeData.id);
    if (isNaN(parentId)) {
      throw new Error(Strings.errorGettingLevelId);
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        await cloneSubtree(child, parentId, false);
      }
    }
    return newNodeData;
  };

  const handleCloneLevel = async () => {
    if (!selectedNode?.data) return;
    try {
      setIsCloning(true);

      await cloneSubtree(selectedNode.data, null, true);
      await handleGetLevels();
    } catch (error) {
      console.error(Strings.errorCloningTheLevel, error);
      notification.error({
        message: "Cloning Error",
        description: "There was an error while cloning the level. Please try again later.",
        placement: "topRight",
      });
    } finally {
      setIsCloning(false);
      setContextMenuVisible(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedLevelId(null);
  };

  const handleDrawerClose = () => {
    createForm.resetFields();
    updateForm.resetFields();
    setDrawerVisible(false);
    setDrawerType(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (drawerType === "create") {
        const supIdNum = Number(values.superiorId);
        const newNode = new CreateNode(
          values.name?.trim(),
          values.description?.trim(),
          Number(values.responsibleId) || 0,
          Number(location.state.siteId),
          supIdNum,
          values.levelMachineId?.trim() || Strings.empty,
          values.notify ? 1 : 0
        );
        await createLevel(newNode).unwrap();
      } else if (drawerType === "update") {
        const { superiorId, ...updateValues } = values;
        const updatePayload = {
          ...updateValues,
          id: Number(values.id),
          responsibleId: values.responsibleId
            ? Number(values.responsibleId)
            : null,
        };
        await updateLevel(updatePayload).unwrap();
      }
      await handleGetLevels();
      handleDrawerClose();
    } catch (error) {
      console.error(Strings.errorOnSubmit);
      notification.error({
        message: "Submiting Error",
        description: "There was an error while submiting. Please try again later.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCustomNodeElement = (rd3tProps: any) => {
    const { nodeDatum, toggleNode } = rd3tProps;
    const getCollapsedState = (nodeId: string): boolean => {
      const storedState = localStorage.getItem(`${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`);
      return storedState === "true";
    };
    const setCollapsedState = (nodeId: string, isCollapsed: boolean) => {
      localStorage.setItem(`${Constants.nodeStartBridgeCollapsed}${nodeId}${Constants.nodeEndBridgeCollapserd}`, isCollapsed.toString());
    };
    const isCollapsed = getCollapsedState(nodeDatum.id);
    nodeDatum.__rd3t.collapsed = isCollapsed;
    const getFillColor = (status: string | undefined) => {
      switch (status) {
        case Strings.detailsOptionC:
          return "#383838";
        case Strings.detailsOptionS:
          return "#999999";
        case Strings.activeStatus:
        default:
          return isLeafNode(nodeDatum) ? "#FFFF00" : "#145695";
      }
    };
    const fillColor = getFillColor(nodeDatum.status);
    const handleContextMenu = (e: React.MouseEvent<SVGGElement>) => {
      e.preventDefault();
      if (containerRef.current) {
        const offsetX = e.currentTarget.getBoundingClientRect().right;
        const offsetY = e.currentTarget.getBoundingClientRect().top;
        setContextMenuPos({ x: offsetX - 50, y: offsetY - 60 });
      }
      setSelectedNode({ data: nodeDatum });
      setContextMenuVisible(true);
    };
    const handleShowDetails = (nodeId: string) => {
      if (nodeId !== "0") {
        closeAllDrawers();
        setSelectedLevelId(nodeId);
        setDetailsVisible(true);
        setContextMenuVisible(false);
      }
    };
    const handleLeftClick = (e: React.MouseEvent<SVGGElement>) => {
      e.stopPropagation();
      setContextMenuVisible(false);
      const newCollapsedState = !nodeDatum.__rd3t.collapsed;
      setCollapsedState(nodeDatum.id, newCollapsedState);
      handleShowDetails(nodeDatum.id);
      toggleNode();
    };
    return (
      <g onClick={handleLeftClick} onContextMenu={handleContextMenu}>
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

  const isRootNode = selectedNode?.data?.id === "0";

  return (
    <div className="h-full flex flex-col">
      <div
        ref={containerRef}
        className="flex-grow bg-white border border-gray-300 shadow-md rounded-md m-4 p-4 relative overflow-hidden"
        style={{ height: "calc(100vh - 6rem)" }}
        onPointerDown={() => {
          setContextMenuVisible(false);
        }}
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
                renderCustomNodeElement={renderCustomNodeElement}
                collapsible={true}
              />
            )}
            {isCloning && (
              <div className="absolute inset-0 flex justify-center items-center bg-gray-100 bg-opacity-50 z-50">
                <Spin size="large" tip={Strings.cloningLevelsMessage} />
              </div>
            )}
          </>
        )}
      </div>

      {contextMenuVisible &&
        (role === UserRoles.IHSISADMIN || role === UserRoles.LOCALSYSADMIN) && (
          <div
            className="bg-white border border-gray-300 shadow-md p-2 flex flex-col gap-2 z-50 absolute"
            style={{
              top: contextMenuPos.y,
              left: contextMenuPos.x,
            }}
          >
            {isRootNode ? (
              <>
                <Button
                  className="w-28 bg-green-700 text-white mx-auto"
                  onClick={handleCreateLevel}
                >
                  {Strings.levelsTreeOptionCreate}
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-28 bg-green-700 text-white mx-auto"
                  onClick={handleCreateLevel}
                >
                  {Strings.levelsTreeOptionCreate}
                </Button>
                <Button
                  className="w-28 bg-blue-700 text-white mx-auto"
                  onClick={handleUpdateLevel}
                >
                  {Strings.levelsTreeOptionEdit}
                </Button>
                <Button
                  className="w-28 bg-yellow-500 text-white mx-auto"
                  onClick={handleCloneLevel}
                >
                  {Strings.levelsTreeOptionClone}
                </Button>
              </>
            )}
          </div>
        )}

      {detailsVisible && selectedLevelId && (
        <Drawer
          mask={false}
          maskClosable={false}
          title={Strings.levelDetailsTitle.concat(
            selectedNode?.data?.name ? `: ${selectedNode.data.name}` : ""
          )}
          placement={drawerPlacement}
          height={drawerPlacement === "bottom" ? "50vh" : undefined}
          width={drawerPlacement === "right" ? 400 : undefined}
          onClose={handleCloseDetails}
          open={detailsVisible}
          destroyOnClose
          closable={true}
          className="drawer-responsive"
        >
          <LevelDetails
            levelId={selectedLevelId}
            onClose={handleCloseDetails}
            siteId={siteId}
          />
        </Drawer>
      )}

      <Drawer
        title={
          drawerType === "create"
            ? Strings.levelsTreeOptionCreate.concat(
                selectedNode?.data?.name
                  ? ` ${Strings.for} "${selectedNode.data.name}"`
                  : Strings.empty
              )
            : drawerType === "update"
            ? Strings.levelsTreeOptionEdit.concat(
                selectedNode?.data?.name
                  ? ` "${selectedNode.data.name}" ${Strings.level}`
                  : Strings.empty
              )
            : Strings.empty
        }
        placement={drawerPlacement}
        height={drawerPlacement === "bottom" ? "50vh" : undefined}
        width={drawerPlacement === "right" ? 400 : undefined}
        onClose={handleDrawerClose}
        open={drawerVisible}
        destroyOnClose
        closable={true}
        className="drawer-responsive"
        mask={false}
        maskClosable={false}
      >
        <Form.Provider
          onFormFinish={async (_name, { values }) => {
            await handleSubmit(values);
          }}
        >
          <div className="drawer-content">
            {drawerType === "create" ? (
              <RegisterLevelForm form={createForm} />
            ) : drawerType === "update" ? (
              <UpdateLevelForm form={updateForm} initialValues={formData} />
            ) : null}
            <div className="mt-4 flex justify-end">
              <Button
                type="primary"
                loading={isLoading}
                onClick={() => {
                  if (drawerType === "create") {
                    createForm.submit();
                  } else if (drawerType === "update") {
                    updateForm.submit();
                  }
                }}
              >
                {Strings.save}
              </Button>
            </div>
          </div>
        </Form.Provider>
      </Drawer>
    </div>
  );
};

export default Levels;
