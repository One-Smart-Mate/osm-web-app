import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import Strings from "../../utils/localizations/Strings";
import CustomButton from "../../components/CustomButtons";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import {
  useCreateLevelMutation,
  useGetlevelsMutation,
} from "../../services/levelService";
import { Level } from "../../data/level/level";
import { Form, Input, Space } from "antd";
import LevelCollapse from "./components/LevelCollapse";
import { useAppDispatch, useAppSelector } from "../../core/store";
import ModalForm from "../../components/ModalForm";
import RegisterLevelForm from "./components/RegisterLevelForm";
import {
  resetLevelCreatedIndicator,
  resetLevelUpdatedIndicator,
  selectLevelCreatedIndicator,
  selectLevelUpdatedIndicator,
  setSiteId,
} from "../../core/genericReducer";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import { CreateLevel } from "../../data/level/level.request";
import { UnauthorizedRoute } from "../../utils/Routes";
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
  rol: UserRoles;
}

const Levels = ({ rol }: Props) => {
  const [getLevels] = useGetlevelsMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<Level[]>([]);
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<Level[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerLevel] = useCreateLevelMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isLevelCreated = useAppSelector(selectLevelCreatedIndicator);
  const isLevelUpdated = useAppSelector(selectLevelUpdatedIndicator);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLevelCreated || isLevelUpdated) {
      handleGetLevels();
      dispatch(resetLevelCreatedIndicator());
      dispatch(resetLevelUpdatedIndicator());
    }
  }, [isLevelCreated, isLevelUpdated, dispatch]);
  const handleOnSearch = (event: any) => {
    const getSearch = event.target.value;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));

      setData(filterData);
    } else {
      setData(dataBackup);
    }
    setQuerySearch(getSearch);
  };

  const search = (item: Level, search: string) => {
    const { name, description } = item;

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase())
    );
  };

  const buildCreateLevelAction = () => {
    if (rol === UserRoles.IHSISADMIN) {
      return (
        <CustomButton
          onClick={handleOnClickCreateButton}
          type="success"
          className="w-full md:w-auto"
        >
          {Strings.create}
        </CustomButton>
      );
    }
  };

  const handleOnClickCreateButton = () => {
    setModalOpen(true);
  };
  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };

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
          values.levelMachineId && values.levelMachineId.trim(),
          values.notify ? 1 : 0
        )
      ).unwrap();
      setModalOpen(false);
      handleGetLevels();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      console.error(Strings.errorOnSubmit);
      notification.error({
        message: "Submiting Error",
        description: "There was an error while submiting. Please try again later.",
        placement: "topRight",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const siteName = location?.state?.siteName || Strings.empty;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-2 items-center m-3">
          <PageTitle mainText={Strings.levelsof} subText={siteName} />
          <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
            <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
              <Space className="w-full md:w-auto mb-1 md:mb-0">
                <Input
                  className="w-full"
                  onChange={handleOnSearch}
                  value={querySearch}
                  addonAfter={<IoIosSearch />}
                />
              </Space>
            </div>
            <div className="flex mb-1 md:mb-0 md:justify-end w-full md:w-auto">
              {buildCreateLevelAction()}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <LevelCollapse data={data} isLoading={isLoading} />
        </div>
      </div>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormCreateFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={RegisterLevelForm}
          title={Strings.createLevel.concat(` ${siteName}`)}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default Levels;
