import React, { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import Strings from "../../utils/localizations/Strings";
import PageTitle from "../../components/PageTitle";
import LevelDetails from "./components/LevelDetails";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useCreateLevelMutation,
  useGetlevelsMutation,
  useUdpateLevelMutation,
} from "../../services/levelService";
import { Level } from "../../data/level/level";
import { Form } from "antd";
import ModalForm from "../../components/ModalForm";
import RegisterLevelForm from "./components/RegisterLevelForm";
import UpdateLevelForm from "./components/UpdateLevelForm";
import { useAppDispatch } from "../../core/store";
import { setSiteId } from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import { CreateNode } from "../../data/level/level.request";
import { UserRoles } from "../../utils/Extensions";

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

interface Props {
  role: UserRoles;
}

const Levels = ({ role }: Props) => {
  const [getLevels] = useGetlevelsMutation();
  const [createLevel] = useCreateLevelMutation();
  const [updateLevel] = useUdpateLevelMutation();

  const [isLoading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [formData, setFormData] = useState<any>({});
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [panelInfo, setPanelInfo] = useState({ visible: false, x: 0, y: 0 });
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const siteName = location.state?.siteName || Strings.defaultSiteName;

  useEffect(() => {
    handleGetLevels();
  }, [location.state]);

  const handleGetLevels = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }

    setLoading(true);
    try {
      const response = await getLevels(location.state.siteId).unwrap();
      setTreeData([
        { name: Strings.levelsOf.concat(siteName), id: "0", children: buildHierarchy(response) },
      ]);
      dispatch(setSiteId(location.state.siteId));

      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (error) {
      console.error(Strings.errorFetchingLevels, error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node: any, event: any) => {
    event.preventDefault();
    setSelectedNode(node);
    setPanelInfo({ visible: true, x: event.clientX, y: event.clientY });
  };

  const handleCreateLevel = () => {
    setModalType("create");
    setModalOpen(true);
    setFormData({ superiorId: selectedNode?.data?.id });
    setPanelInfo({ ...panelInfo, visible: false });
  };

  const handleUpdateLevel = () => {
    setModalType("update");
    setModalOpen(true);
    setFormData(selectedNode?.data || {});
    setPanelInfo({ ...panelInfo, visible: false });
  };

  const handleShowDetails = () => {
    if (selectedNode?.data?.id) {
      setSelectedLevelId(selectedNode.data.id);
      setDetailsVisible(true);
      setPanelInfo({ ...panelInfo, visible: false });
    }
  };

  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedLevelId(null);
  };

  const handleOnFormFinish = async (values: any) => {
    setLoading(true);
    try {
      if (modalType === "create") {
        const newNode = new CreateNode(
          values.name.trim(),
          values.description.trim(),
          Number(values.responsibleId) || 0,
          Number(location.state.siteId),
          Number(formData.superiorId),
          values.levelMachineId?.trim() || "",
          values.notify ? 1 : 0
        );
        await createLevel(newNode).unwrap();
      } else {
        await updateLevel({
          ...values,
          id: Number(formData.id),
          responsibleId: values.responsibleId ? Number(values.responsibleId) : null,
        }).unwrap();
      }
      setModalOpen(false);
      handleGetLevels();
    } catch (error) {
      console.error(Strings.errorSavingLevel, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-2 items-center m-3">
        <PageTitle mainText={Strings.levelsOf} subText={siteName} />
      </div>

      <div ref={containerRef} className="border-4 border-slate-900 rounded-md bg-white p-4 mt-5 h-[500px] w-full">
        {treeData.length > 0 && (
          <Tree
            data={treeData}
            collapsible={false}
            orientation="horizontal"
            translate={translate}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>

      {panelInfo.visible && (
  <div
    className="absolute bg-white border border-gray-300 p-4 shadow-md z-50 flex flex-col rounded-md"
    style={{ top: `${panelInfo.y}px`, left: `${panelInfo.x}px` }}
  >
    {selectedNode?.data?.id !== "0" && (
      <>
        <button className="py-1 px-4 mb-2 bg-yellow-500 text-white rounded-md" onClick={handleShowDetails}>
          {Strings.details}
        </button>
        <button className="py-1 px-4 mb-2 bg-blue-700 text-white rounded-md" onClick={handleUpdateLevel}>
          {Strings.updateLevelTree}
        </button>
      </>
    )}
    <button className="py-1 px-4 mb-2 bg-green-700 text-white rounded-md" onClick={handleCreateLevel}>
      {Strings.createLevelBtn}
    </button>
    <button
      className="py-1 px-4 bg-red-700 text-white rounded-md"
      onClick={() => setPanelInfo({ ...panelInfo, visible: false })}
    >
      {Strings.close}
    </button>
  </div>
)}

      {detailsVisible && selectedLevelId && (
        <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 p-4">
          <LevelDetails levelId={selectedLevelId} onClose={handleCloseDetails} />
        </div>
      )}

      <Form.Provider onFormFinish={async (_, { values }) => await handleOnFormFinish(values)}>
        <ModalForm
          open={modalIsOpen}
          onCancel={() => setModalOpen(false)}
          FormComponent={({ form }) =>
            modalType === "create" ? (
              <RegisterLevelForm form={form} />
            ) : (
              <UpdateLevelForm form={form} initialValues={formData} />
            )
          }
          title={
            modalType === "create"
              ? Strings.createLevel.concat(Strings.newLevel)
              : Strings.updateLevelTree.concat(Strings.level)
          }
          isLoading={isLoading}
        />
      </Form.Provider>
    </div>
  );
};

export default Levels;
