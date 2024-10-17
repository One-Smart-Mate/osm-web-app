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
    const response = await getLevels(location.state.siteId).unwrap();
    setData(response);
    setDataBackup(response);
    dispatch(setSiteId(location.state.siteId));
    setLoading(false);
  };

  useEffect(() => {
    handleGetLevels();
  }, [location.state]);

  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      if (values.responsibleId && values.responsibleId !== "0") {
        values.responsibleId = Number(values.responsibleId);
      } else {
        values.responsibleId = null;
      }
      await registerLevel(
        new CreateLevel(
          values.name.trim(),
          values.description.trim(),
          values.responsibleId,
          Number(location.state.siteId),
          values.levelMachineId && values.levelMachineId.trim(),
          values.notify ? 1 : 0
        )
      ).unwrap();
      setModalOpen(false);
      handleGetLevels();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      handleErrorNotification(error);
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
