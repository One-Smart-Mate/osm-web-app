import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  List,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import Strings from "../../utils/localizations/Strings";
import {
  useCreateUserMutation,
  useGetUsersWithPositionsMutation,
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
import { UploadOutlined } from "@ant-design/icons";
import ImportUsersForm from "./components/ImportUsersForm";
import { BsDiagram2, BsMailbox, BsPersonLinesFill } from "react-icons/bs";
import UpdateUserButton from "./components/UpdateUserButton";
import AssignPositionsButton from "./components/AssignPositionsButton";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../../components/PaginatedList";
import { FormInstance } from "antd/lib";

const SiteUsersV2 = () => {
  const [getUsersWithPositions] = useGetUsersWithPositionsMutation();
  const [data, setData] = useState<UserCardInfo[]>([]);
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(Strings.empty);
  const [registerUser] = useCreateUserMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSiteUpdated = useAppSelector(selectUserUpdatedIndicator);
  const [importUsers] = useImportUsersMutation();
  const navigate = useNavigate();
  const { isIhAdmin } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state.siteId || Strings.empty;

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
    const response = await getUsersWithPositions(
      location.state.siteId
    ).unwrap();
    setData(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetUsers();
  }, [location.state]);


  const search = useCallback((item: UserCardInfo, query: string): boolean => {
    const normalizedQuery = query.toLowerCase();
    const { name, email } = item;
  
    return (
      email.toLowerCase().includes(normalizedQuery) ||
      name.toLowerCase().includes(normalizedQuery)
    );
  }, []);

  const filteredData = useMemo(() => {
    if (searchQuery.length > 0) {
      return data.filter((item) =>
        search(item, searchQuery)
      );
    }
    return data;
  }, [searchQuery, data]);
  
  const handleOnSearch = (query: string) => {
    setSearchQuery(query);
  };


  const handleOnOpenModal = (modalType: string) => {
    setModalOpen(true);
    setModalType(modalType);
  };

  const selectFormByModalType = (
    modalType: string,
    form: FormInstance
  ): React.ReactElement => {
    if (modalType === Strings.users) {
      return <RegisterSiteUserForm form={form} />;
    } else {
      return <ImportUsersForm form={form} />;
    }
  };

  const selecTitleByModalType = (modalType: string) => {
    if (modalType === Strings.users) {
      return `${Strings.createUserFor} ${siteName}`;
    } else {
      return `${Strings.importUsersFor} ${siteName}`;
    }
  };

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
    <MainContainer
      title={Strings.usersOf}
      description={siteName}
      isLoading={isLoading}
      enableCreateButton={true}
      enableSearch={true}
      onSearchChange={handleOnSearch}
      enableBackButton={isIhAdmin()}
      onCreateButtonClick={() => handleOnOpenModal(Strings.users)}
      content={
        <div>
          <div className="flex justify-end pb-2">
            <Button
              onClick={() => handleOnOpenModal(Strings.empty)}
              type="default"
              className="w-full md:w-auto"
            >
              <UploadOutlined />
              {Strings.importUsers}
            </Button>
          </div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={filteredData}
            renderItem={(value: UserCardInfo, index: number) => (
              <List.Item key={index}>
                <Card
                  hoverable
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
                  <AnatomySection
                    title={Strings.email}
                    label={value.email}
                    icon={<BsMailbox />}
                  />

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
                    icon={<BsPersonLinesFill />}
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
                    icon={<BsDiagram2 />}
                  />
                </Card>
              </List.Item>
            )}
            loading={isLoading}
          />

          <Form.Provider
            onFormFinish={async (_, { values }) => {
              await handleOnFormFinish(values);
            }}
          >
            <ModalForm
              open={modalIsOpen}
              onCancel={handleOnCancelButton}
              FormComponent={(form: FormInstance) =>
                selectFormByModalType(modalType, form)
              }
              title={selecTitleByModalType(modalType)}
              isLoading={modalIsLoading}
            />
          </Form.Provider>
        </div>
      }
    />
  );
};

export default SiteUsersV2;
