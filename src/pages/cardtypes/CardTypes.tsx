import { Drawer, Dropdown, Form, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import { useLocation, useNavigate } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import RegisterCardTypeForm from "./components/RegisterCardTypeForm";
import UpdateCardTypeForm from "./components/UpdateCardTypeForm";
import RegisterPreclassifierForm2 from "./components/preclassifier/RegisterPreclassifierForm";
import UpdatePreclassifierForm2 from "./components/preclassifier/UpdatePreclassifierForm";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import {
  useCreateCardTypeMutation,
  useGetCardTypesMutation,
  useUpdateCardTypeMutation,
} from "../../services/CardTypesService";
import {
  useCreatePreclassifierMutation,
  useGetPreclassifiersMutation,
  useUpdatePreclassifierMutation,
} from "../../services/preclassifierService";
import { setSiteId } from "../../core/genericReducer";
import { useAppDispatch } from "../../core/store";
import { CardTypes } from "../../data/cardtypes/cardTypes";
import {
  CreateCardType,
  UpdateCardTypeReq,
} from "../../data/cardtypes/cardTypes.request";
import { CreatePreclassifier } from "../../data/preclassifier/preclassifier.request";
import { UserRoles } from "../../utils/Extensions";

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

interface CardTypesTreeProps {
  rol: UserRoles;
}

const CardTypesTree = ({ rol }: CardTypesTreeProps) => {
  const [getCardTypes] = useGetCardTypesMutation();
  const [createCardType] = useCreateCardTypeMutation();
  const [updateCardType] = useUpdateCardTypeMutation();
  const [getPreclassifiers] = useGetPreclassifiersMutation();
  const [createPreclassifier] = useCreatePreclassifierMutation();
  const [updatePreclassifier] = useUpdatePreclassifierMutation();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [formData, setFormData] = useState<any>(null);
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [createPreForm] = Form.useForm();
  const [updatePreForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation() as unknown as Location & { state: LocationState };
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isMobile = useMediaQuery("(max-width: 768px)");

  const stripCloneSuffix = (original: string) => {
    return original.replace(/\(Clone.*\)$/i, Strings.empty).trim();
  };

  const formatColor = (colorValue: any) => {
    if (!colorValue) return "transparent";
    let c =
      typeof colorValue === "string" ? colorValue : colorValue?.toHex?.() || Strings.empty;
    return c.startsWith("#") ? c.slice(1) : c;
  };

  useEffect(() => {
    if (location?.state?.siteId) {
      handleLoadData(location.state.siteId);
    } else {
      navigate("/unauthorized");
    }
  }, [location.state]);

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
      setTreeData([
        {
          name: `${Strings.cardType} ${location.state.siteName}`,
          nodeType: "cardType",
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
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setDrawerType(null);
    setFormData(null);
    setSelectedNode(null);
    createForm.resetFields();
    updateForm.resetFields();
    createPreForm.resetFields();
    updatePreForm.resetFields();
  };

  const handleDrawerOpen = (type: DrawerType, data: any = null) => {
    setDrawerType(type);
    setDrawerVisible(true);
    setSelectedNode(data || null);
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

  const handleOnFormFinish = async (values: any) => {
    try {
      setLoading(true);
      if (drawerType === Strings.cardTypesDrawerTypeCreateCardType) {
        if (!values.cardTypeMethodology) {
          throw new Error(Strings.cardTypesMethodologyError);
        }
        const aux = values.cardTypeMethodology.split(" - ");
        const cardTypeMethodology = aux[1];
        const methodologyName = aux[0];
        const newCardType = new CreateCardType(
          cardTypeMethodology,
          Number(location.state.siteId),
          methodologyName,
          values.name?.trim() || Strings.empty,
          values.description?.trim() || Strings.empty,
          formatColor(values.color),
          Number(values.responsableId || 0),
          Number(values.quantityPicturesCreate || 0),
          Number(values.quantityAudiosCreate || 0),
          Number(values.quantityVideosCreate || 0),
          Number(values.audiosDurationCreate || 0),
          Number(values.videosDurationCreate || 0),
          Number(values.quantityPicturesClose || 0),
          Number(values.quantityAudiosClose || 0),
          Number(values.quantityVideosClose || 0),
          Number(values.audiosDurationClose || 0),
          Number(values.videosDurationClose || 0),
          Number(values.quantityPicturesPs || 0),
          Number(values.quantityAudiosPs || 0),
          Number(values.quantityVideosPs || 0),
          Number(values.audiosDurationPs || 0),
          Number(values.videosDurationPs || 0)
        );
        await createCardType(newCardType).unwrap();
        handleSucccessNotification(NotificationSuccess.REGISTER);
      } else if (
        drawerType === Strings.cardTypesDrawerTypeUpdateCardType &&
        selectedNode
      ) {
        const updatedCardType = new UpdateCardTypeReq(
          Number(selectedNode.id),
          values.methodology?.trim() || Strings.empty,
          values.name?.trim() || Strings.empty,
          values.description?.trim() || Strings.empty,
          formatColor(values.color),
          Number(values.responsableId || 0),
          Number(values.quantityPicturesCreate || 0),
          Number(values.quantityAudiosCreate || 0),
          Number(values.quantityVideosCreate || 0),
          Number(values.audiosDurationCreate || 0),
          Number(values.videosDurationCreate || 0),
          Number(values.quantityPicturesClose || 0),
          Number(values.quantityAudiosClose || 0),
          Number(values.quantityVideosClose || 0),
          Number(values.audiosDurationClose || 0),
          Number(values.videosDurationClose || 0),
          Number(values.quantityPicturesPs || 0),
          Number(values.quantityAudiosPs || 0),
          Number(values.quantityVideosPs || 0),
          Number(values.audiosDurationPs || 0),
          Number(values.videosDurationPs || 0),
          values.status || Strings.active.toUpperCase()
        );
        await updateCardType(updatedCardType).unwrap();
        handleSucccessNotification(NotificationSuccess.UPDATE);
      } else if (drawerType === Strings.cardTypesDrawerTypeCreatePreclassifier) {
        if (!formData?.cardTypeId) {
          throw new Error(Strings.cardTypesNoCardTypeIdError);
        }
        const newPre = new CreatePreclassifier(
          values.code?.trim() || Strings.empty,
          values.description?.trim() || Strings.empty,
          Number(formData.cardTypeId)
        );
        await createPreclassifier(newPre).unwrap();
        handleSucccessNotification(NotificationSuccess.REGISTER);
      } else if (
        drawerType === Strings.cardTypesDrawerTypeUpdatePreclassifier &&
        selectedNode
      ) {
        const payload = {
          id: Number(selectedNode.id),
          preclassifierCode: values.code?.trim() || Strings.empty,
          preclassifierDescription: values.description?.trim() || Strings.empty,
          status: values.status || Strings.activeStatus,
        };
        await updatePreclassifier(payload).unwrap();
        handleSucccessNotification(NotificationSuccess.UPDATE);
      }
      setDrawerVisible(false);
      await handleLoadData(location.state.siteId);
    } catch (error) {
      handleErrorNotification(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomNodeElement = (rd3tProps: any) => {
    const { nodeDatum } = rd3tProps;
    const isRoot = nodeDatum.__rd3t.depth === 0;
    const isPreclassifier = nodeDatum.nodeType === "preclassifier";
    const fillColor = isRoot
      ? "#145695"
      : isPreclassifier
      ? "#FFFF00"
      : "#145695";
      const textStyles = {
        fontSize: isRoot ? "26px" : "16px",
        fontWeight: "light",  
        fill: "#000",
      };
      
    const handleEditPre = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeUpdatePreclassifier, nodeDatum);
    };
    const handleClonePre = () => {
      handleDrawerOpen(Strings.cardTypesDrawerTypeCreatePreclassifier, nodeDatum);
    };
    const handleCancelPre = () => {};
    if (isPreclassifier) {
      const preMenu = [
        {
          key: "editPre",
          label: (
            <button className="w-28 bg-blue-700 text-white p-2 rounded-md text-xs">
              {Strings.cardTypesEditPreclassifier}
            </button>
          ),
          onClick: handleEditPre,
        },
        {
          key: "clonePre",
          label: (
            <button className="w-28 bg-yellow-500 text-white p-2 rounded-md text-xs">
              {Strings.cardTypesClonePreclassifier}
            </button>
          ),
          onClick: handleClonePre,
        },
        {
          key: "cancelPre",
          label: (
            <button className="w-28 bg-red-700 text-white p-2 rounded-md text-xs">
              {Strings.cardTypesCancel}
            </button>
          ),
          onClick: handleCancelPre,
        },
      ];
      return (
        <g>
          <Dropdown menu={{ items: preMenu }} trigger={["contextMenu"]}>
            <circle r={18} fill={fillColor} style={{ cursor: "pointer" }} />
          </Dropdown>
          <text x={25} y={5} style={textStyles}>
            {nodeDatum.name}
          </text>
        </g>
      );
    }
    if (isRoot) {
      const handleCreateCardType = () => {
        handleDrawerOpen(Strings.cardTypesDrawerTypeCreateCardType);
      };
      const handleCancelRoot = () => {};
      const rootMenu = [
        {
          key: "createCT",
          label: (
            <button className="w-28 bg-green-700 text-white p-2 rounded-md text-xs">
              {Strings.cardTypesCreate}
            </button>
          ),
          onClick: handleCreateCardType,
        },
        {
          key: "cancelRoot",
          label: (
            <button className="w-28 bg-red-700 text-white p-2 rounded-md text-xs">
              {Strings.cardTypesCancel}
            </button>
          ),
          onClick: handleCancelRoot,
        },
      ];
      return (
        <g>
          <Dropdown menu={{ items: rootMenu }} trigger={["contextMenu"]}>
            <circle r={22} fill={fillColor} style={{ cursor: "pointer" }} />
          </Dropdown>
          <text x={-200} y={-40} style={{ fontSize: "18px", fill: "#1e88e5", fontWeight: "normal" }}>
            {Strings.cardType} {location.state?.siteName || Strings.defaultSiteName}
          </text>
        </g>
      );
    }
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
    const handleCancelCT = () => {};
    const ctMenu = [
      {
        key: Strings.cardTypesOptionEdit,
        label: (
          <button className="w-28 bg-blue-700 text-white p-2 rounded-md text-xs">
            {Strings.cardTypesEdit}
          </button>
        ),
        onClick: handleEditCT,
      },
      {
        key: Strings.cardTypesOptionClone,
        label: (
          <button className="w-28 bg-yellow-500 text-white p-2 rounded-md text-xs">
            {Strings.cardTypesCloneCardType}
          </button>
        ),
        onClick: handleCloneCT,
      },
      {
        key: Strings.cardTypesOptionCreate,
        label: (
          <button className="w-28 bg-green-700 text-white p-2 rounded-md text-xs">
            {Strings.cardTypesCreatePreclassifier}
          </button>
        ),
        onClick: handleCreatePre,
      },
      {
        key: Strings.cardTypesOptionCancel,
        label: (
          <button className="w-28 bg-red-700 text-white p-2 rounded-md text-xs">
            {Strings.cardTypesCancel}
          </button>
        ),
        onClick: handleCancelCT,
      },
    ];
    return (
      <g>
        <Dropdown menu={{ items: ctMenu }} trigger={["contextMenu"]}>
          <circle r={18} fill={fillColor} style={{ cursor: "pointer" }} />
        </Dropdown>
        <text x={20} y={35} style={{ fontSize: "16px", fill: "#000", fontWeight: "normal" }}>
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
            <Spin spinning={loading} tip={Strings.cardTypesLoadingData} />
          </div>
        )}
        {!loading && treeData.length > 0 && (
          <Tree
            data={treeData}
            orientation="horizontal"
            translate={translate}
            renderCustomNodeElement={renderCustomNodeElement}
            collapsible
            zoomable
          />
        )}
      </div>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormFinish(values);
        }}
      >
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
          destroyOnClose
          mask={false}
        >
          {drawerType === Strings.cardTypesDrawerTypeCreateCardType && (
            <RegisterCardTypeForm
              form={createForm}
              onFinish={handleOnFormFinish}
              rol={rol}
              initialValues={formData}
            />
          )}
          {drawerType === Strings.cardTypesDrawerTypeUpdateCardType && (
            <UpdateCardTypeForm
              form={updateForm}
              initialValues={formData}
              onFinish={handleOnFormFinish}
            />
          )}
          {drawerType === Strings.cardTypesDrawerTypeCreatePreclassifier && (
            <RegisterPreclassifierForm2
              form={createPreForm}
              initialValues={formData}
            />
          )}
          {drawerType === Strings.cardTypesDrawerTypeUpdatePreclassifier && (
            <UpdatePreclassifierForm2
              form={updatePreForm}
              initialValues={formData}
            />
          )}
        </Drawer>
      </Form.Provider>
    </div>
  );
};

export default CardTypesTree;
