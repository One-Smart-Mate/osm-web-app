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
import { Form, Drawer, Spin, Modal } from "antd";
import { useAppDispatch } from "../../core/store";
import { setSiteId } from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import { CreateNode } from "../../data/level/level.request";
import { UserRoles } from "../../utils/Extensions";
import Constants from "../../utils/Constants";
import CustomNodeElement from "./components/CustomNodeElement";
import LevelContextMenu from "./components/LevelContextMenu";
import LevelFormDrawer from "./components/LevelFormDrawer";

import { useGetSiteMutation } from "../../services/siteService";


interface Props {
  role: UserRoles;
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

const Levels = ({ role }: Props) => {
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [positionForm] = Form.useForm();

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
  const [drawerType, setDrawerType] = useState<"create" | "update" | "position" | null>(null);
  const [formData, setFormData] = useState<any>({});

  const [drawerPlacement, setDrawerPlacement] = useState<"right" | "bottom">("right");

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const siteName = location.state?.siteName || Strings.defaultSiteName;
  const siteId = location.state?.siteId;

  
  const [positionData, setPositionData] = useState<any>(null);

  const [, setSiteData] = useState<any>(null);


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
      throw error;
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


const [getSite] = useGetSiteMutation();

const handleCreatePosition = async () => {
  closeAllDrawers();
  
  
  if (!selectedNode?.data?.id) {
    return;
  }

  const level = selectedNode.data;

  try {
    


    
    const siteResponse = await getSite(location.state.siteId).unwrap();
    setSiteData(siteResponse);

    
    const newPositionData = {
      siteId: Number(location.state.siteId),
      siteName: location.state.siteName,
      siteType: siteResponse.siteType,  
      areaId: 2,                         
      areaName: "Development",           
      levelId: Number(level.id),         
      levelName: level.name,     
      route: level.levelLocation,
    };
    
    
    setPositionData(newPositionData);
    
    
    positionForm.resetFields();
    setDrawerType("position");
    setDrawerVisible(true);
    setContextMenuVisible(false);
  } catch (error) {
    throw error;
  }
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
      Constants.notify,
    ];
    const payload = allowedProperties.reduce((acc: any, key: string) => {
      if (node[key] !== undefined) {
        if (
          [Constants.responsibleId, Constants.siteId, Constants.superiorId, Constants.notify].includes(key)
        ) {
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

    
    payload.levelMachineId = null;

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
    
    Modal.confirm({
      title: Strings.confirmCloneLevel,
      content: `${Strings.confirmCloneLevelMessage}` + Strings.levelSubLebelsWarning,
      okText: Strings.yes,
      cancelText: Strings.no,
      onOk: async () => {
        try {
          setIsCloning(true);
          await cloneSubtree(selectedNode.data, null, true);
          await handleGetLevels();
        } catch (error) {
          throw error;
        } finally {
          setIsCloning(false);
          setContextMenuVisible(false);
        }
      },
      onCancel: () => {
        setContextMenuVisible(false);
      }
    });
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedLevelId(null);
  };

  const handleDrawerClose = () => {
    createForm.resetFields();
    updateForm.resetFields();
    positionForm.resetFields();
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
          responsibleId: values.responsibleId ? Number(values.responsibleId) : null,
        };
        await updateLevel(updatePayload).unwrap();
      }
      
      await handleGetLevels();
      handleDrawerClose();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  
  const handleShowDetails = (nodeId: string) => {
    if (nodeId !== "0") {
      closeAllDrawers();
      setSelectedLevelId(nodeId);
      setDetailsVisible(true);
      setContextMenuVisible(false);
    }
  };

  const renderCustomNodeElement = (rd3tProps: any) => (
    <CustomNodeElement
      nodeDatum={rd3tProps.nodeDatum}
      toggleNode={rd3tProps.toggleNode}
      containerRef={containerRef}
      setContextMenuVisible={setContextMenuVisible}
      setContextMenuPos={setContextMenuPos}
      setSelectedNode={setSelectedNode}
      handleShowDetails={handleShowDetails}
    />
  );

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

      <LevelContextMenu
        isVisible={contextMenuVisible}
        role={role}
        isRootNode={isRootNode}
        contextMenuPos={contextMenuPos}
        handleCreateLevel={handleCreateLevel}
        handleUpdateLevel={handleUpdateLevel}
        handleCloneLevel={handleCloneLevel}
        handleCreatePosition={handleCreatePosition}  
      />

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

      <LevelFormDrawer
        drawerVisible={drawerVisible}
        drawerType={drawerType}
        drawerPlacement={drawerPlacement}
        createForm={createForm}
        updateForm={updateForm}
        positionForm={positionForm}  
        formData={formData}
        isLoading={isLoading}
        handleDrawerClose={handleDrawerClose}
        handleSubmit={handleSubmit}
        selectedNodeName={selectedNode?.data?.name || ""}
        positionData={positionData}
      />
    </div>
  );
};

export default Levels;
