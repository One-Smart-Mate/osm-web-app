import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import CustomButton from "../../components/CustomButtons";
import Strings from "../../utils/localizations/Strings";
import {
  useCreateUserMutation,
  useGetSiteUsersMutation,
  useGetUserPositionsMutation,
  useImportUsersMutation,
} from "../../services/userService";
import { Role, UserCardInfo } from "../../data/user/user";
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
import { BsSearch } from "react-icons/bs";
import UpdateUserButton from "./components/UpdateUserButton";
import Loading from "../../pagesRedesign/components/Loading";
import AssignPositionsButton from "./components/AssignPositionsButton";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import PageTitleTag from "../../components/PageTitleTag";

interface Props {
  rol: UserRoles;
}

const SiteUsersV2 = ({ rol }: Props) => {
  const [getUsers] = useGetSiteUsersMutation();
  const [data, setData] = useState<UserCardInfo[]>([]);
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<UserCardInfo[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(Strings.empty);
  const [registerUser] = useCreateUserMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSiteUpdated = useAppSelector(selectUserUpdatedIndicator);
  const [importUsers] = useImportUsersMutation();
  const navigate = useNavigate();
  const [getUserPositions] = useGetUserPositionsMutation();

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
    let data = [];
    for await (const user of response) {
      const positions = await getUserPositions(user.id).unwrap();
      data.push(
        new UserCardInfo(
          user.id,
          user.name,
          user.email,
          user.roles,
          user.sites,
          positions
        )
      );
    }
    setData(data.sort((a, b) => a.name.localeCompare(b.name)));
    setDataBackup(data);
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

  const search = (item: UserCardInfo, search: string) => {
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
        const useDataNet = values.uploadCardAndEvidenceWithDataNet ? 1 : 0;
        await registerUser(
          new CreateUser(
            values.name.trim(),
            values.email.trim(),
            Number(siteId),
            values.password,
            useDataNet,
            useDataNet,
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
      console.log("An error occurred:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col items-center m-3">
          <PageTitleTag mainText={Strings.usersOf} subText={siteName} />
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">{buildActions()}</div>
          </div>
          <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
            <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
              <Space className="w-full md:w-auto mb-1 md:mb-0">
                <Input
                  className="w-full"
                  onChange={handleOnSearch}
                  value={querySearch}
                  placeholder={Strings.search}
                  addonAfter={<BsSearch />}
                />
              </Space>
            </div>
            <div className="flex mb-1 md:mb-0 md:justify-end w-full md:w-auto">
              <Button
                onClick={() => handleOnOpenModal(Strings.users)}
                className="w-full md:w-auto"
                type="primary"
              >
                {Strings.create}
              </Button>
            </div>
          </div>
        </div>
        <Row gutter={[8, 8]}>
          <Loading isLoading={isLoading} />
          {!isLoading &&
            data.map((value, index) => (
              <Col
                key={`Col-${index}`}
                xs={{ flex: "100%" }}
                sm={{ flex: "60%" }}
                md={{ flex: "50%" }}
                lg={{ flex: "40%" }}
                xl={{ flex: "30%" }}
              >
                <Card
                  hoverable
                  className="rounded-xl shadow-md"
                  title={
                    <Typography.Title level={5}>{value.name}</Typography.Title>
                  }
                  actions={[
                    <UpdateUserButton
                      userId={value.id}
                      siteId={siteId}
                      isSiteUserstable={true}
                      onComplete={() => handleGetUsers()}
                    />,
                    <AssignPositionsButton
                      userId={value.id}
                      siteId={siteId}
                      onPositionsUpdated={() => handleGetUsers()}
                    />,
                  ]}
                >
                  <AnatomySection title={Strings.email} label={value.email} />

                  <AnatomySection
                    title={Strings.roles}
                    label={
                      <Space wrap>
                        {value.roles.map((role: Role) => (
                          <Tooltip key={role.id} title={role.name}>
                            <Tag color="blue" style={{ fontSize: 10 }}>
                              {role.name}
                            </Tag>
                          </Tooltip>
                        ))}
                      </Space>
                    }
                  />
                  <AnatomySection
                    title={Strings.position}
                    label={
                      <Space wrap>
                        {value.positions.length > 0 ? (
                          value.positions.map((position) => (
                            <Tooltip
                              key={position.id}
                              title={position.description}
                            >
                              <Tag
                                color="default"
                                style={{
                                  backgroundColor: "#f0f0f0",
                                  color: "#595959",
                                  fontSize: 10,
                                }}
                              >
                                {position.name}
                              </Tag>
                            </Tooltip>
                          ))
                        ) : (
                          <p style={{ fontSize: 12 }}>
                            {Strings.noPositionsAvailable}
                          </p>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
        </Row>
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

export default SiteUsersV2;
