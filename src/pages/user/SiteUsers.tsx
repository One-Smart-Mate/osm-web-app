import { useEffect, useState } from "react";
import { Form, Input, Space } from "antd";
import { IoIosSearch } from "react-icons/io";
import CustomButton from "../../components/CustomButtons";
import Strings from "../../utils/localizations/Strings";
import PageTitle from "../../components/PageTitle";
import {
  useCreateUserMutation,
  useGetSiteUsersMutation,
  useImportUsersMutation,
} from "../../services/userService";
import { UserTable } from "../../data/user/user";
import UserTableComponent from "./components/UserTable";
import ModalForm from "../../components/ModalForm";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import { CreateUser } from "../../data/user/user.request";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetUserUpdatedIndicator,
  selectUserUpdatedIndicator,
} from "../../core/genericReducer";
import { useLocation, useNavigate } from "react-router-dom";
import RegisterSiteUserForm from "./components/RegisterSiteUserForm";
import { UnauthorizedRoute } from "../../utils/Routes";
import { UserRoles } from "../../utils/Extensions";
import { UploadOutlined } from "@ant-design/icons";
import ImportUsersForm from "./components/ImportUsersForm";

interface Props {
  rol: UserRoles;
}

const SiteUsers = ({ rol }: Props) => {
  const [getUsers] = useGetSiteUsersMutation();
  const [data, setData] = useState<UserTable[]>([]);
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<UserTable[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(Strings.empty);
  const [registerUser] = useCreateUserMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSiteUpdated = useAppSelector(selectUserUpdatedIndicator);
  const [importUsers] = useImportUsersMutation();
  const navigate = useNavigate();

  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };

  useEffect(() => {
    if (isSiteUpdated) {
      handleGetUsers();
      dispatch(resetUserUpdatedIndicator());
    }
  }, [isSiteUpdated, dispatch]);

  const handleGetUsers = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    const response = await getUsers(location.state.siteId).unwrap();
    setData(response);
    setDataBackup(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetUsers();
  }, [location.state]);

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

  const handleOnOpenModal = (modalType: string) => {
    setModalOpen(true);
    setModalType(modalType);
  };

  const selectFormByModalType = (modalType: string) => {
    if (modalType === Strings.users) {
      return RegisterSiteUserForm;
    } else {
      return ImportUsersForm;
    }
  };

  const selecTitleByModalType = (modalType: string) => {
    if (modalType === Strings.users) {
      return `${Strings.createUserFor} ${siteName}`;
    } else {
      return `${Strings.importUsersFor} ${siteName}`;
    }
  };

  const buildActions = () => {
    if (rol === UserRoles.IHSISADMIN) {
      return (
        <CustomButton
          onClick={() => handleOnOpenModal(Strings.empty)}
          type="action"
          className="w-full md:w-auto"
        >
          <UploadOutlined />
          {Strings.importUsers}
        </CustomButton>
      );
    }
  };

  const search = (item: UserTable, search: string) => {
    const { name, email } = item;

    return (
      email.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state.siteId || Strings.empty;

  const handleOnFormFinish = async (values: any) => {
    try {
      setModalLoading(true);
      if (modalType === Strings.users) {
        await registerUser(
          new CreateUser(
            values.name.trim(),
            values.email.trim(),
            Number(siteId),
            values.password,
            values.uploadCardDataWithDataNet ? 1 : 0,
            values.uploadCardEvidenceWithDataNet ? 1 : 0,
            values.roles
          )
        ).unwrap();
      } else {
        const { fileObj } = values;
        const file = fileObj.fileList[0].originFileObj;

        await importUsers({ file, siteId }).unwrap();
      }
      setModalOpen(false);
      handleGetUsers();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      console.log('An error occurred:', error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col items-center m-3">
          <div className="flex flex-wrap gap-2">
            <PageTitle mainText={Strings.usersOf} subText={siteName} />
            <div className="flex items-center">{buildActions()}</div>
          </div>
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
              <CustomButton
                onClick={() => handleOnOpenModal(Strings.users)}
                type="success"
                className="w-full md:w-auto"
              >
                {Strings.create}
              </CustomButton>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto hidden lg:block">
          <UserTableComponent
            data={data}
            siteId={siteId}
            isLoading={isLoading}
            isSiteUserstable={true}
          />
        </div>
      </div>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={selectFormByModalType(modalType)}
          title={selecTitleByModalType(modalType)}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default SiteUsers;
