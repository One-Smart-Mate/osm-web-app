import { useEffect, useState } from "react";
import { Form, Input, Space } from "antd";
import { IoIosSearch } from "react-icons/io";
import CustomButton from "../../components/CustomButtons";
import Strings from "../../utils/localizations/Strings";
import PageTitle from "../../components/PageTitle";
import {
  useCreateUserMutation,
  useGetUsersMutation,
} from "../../services/userService";
import { UserTable } from "../../data/user/user";
import UserTableComponent from "./components/UserTable";
import ModalForm from "../../components/ModalForm";
import RegisterUserForm from "./components/RegisterUserForm";
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

const Users = () => {
  const [getUsers] = useGetUsersMutation();
  const [data, setData] = useState<UserTable[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<UserTable[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerUser] = useCreateUserMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSiteUpdated = useAppSelector(selectUserUpdatedIndicator);

  const handleOnClickCreateButton = () => {
    setModalOpen(true);
  };
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
    setLoading(true);
    const response = await getUsers().unwrap();
    setData(response);
    setDataBackup(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetUsers();
  }, []);

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

  const search = (item: UserTable, search: string) => {
    const { name, email } = item;

    return (
      email.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      await registerUser(
        new CreateUser(
          values.name.trim(),
          values.email.trim(),
          Number(values.siteId),
          values.password,
          values.uploadCardDataWithDataNet ? 1 : 0,
          values.uploadCardEvidenceWithDataNet ? 1 : 0,
          values.roles
        )
      ).unwrap();
      setModalOpen(false);
      handleGetUsers();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-2 items-center m-3">
          <PageTitle mainText={Strings.users} />
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
                onClick={handleOnClickCreateButton}
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
            isLoading={isLoading}
            isSiteUserstable={false}
          />
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
          FormComponent={RegisterUserForm}
          title={Strings.createUser}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default Users;
