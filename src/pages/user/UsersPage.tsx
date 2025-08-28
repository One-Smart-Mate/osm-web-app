import { useCallback, useEffect, useMemo, useState } from "react";
import { List, App as AntApp, Modal, Button } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useGetUsersWithPositionsMutation } from "../../services/userService";
import { UserCardInfo } from "../../data/user/user";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../components/PaginatedList";
import AnatomyNotification from "../components/AnatomyNotification";
import UserForm, { UserFormType } from "./components/UserForm";
import ImportUsersButton from "./components/ImportUsersButton";
import UserCard from "./components/UserCard";
import {
  ImportUser,
  ImportUsersData,
  validateReason,
} from "../../data/user/import.users.response";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";

const UsersPage = () => {
  const [getUsersWithPositions] = useGetUsersWithPositionsMutation();
  const [data, setData] = useState<UserCardInfo[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [importedUsers, setImportedUsers] = useState<ImportUsersData | null>(
    null
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { isIhAdmin } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState<string>(Strings.empty);
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state.siteId || Strings.empty;
  const { notification } = AntApp.useApp();

  useEffect(() => {
    handleGetUsers();
  }, []);

  const handleGetUsers = async () => {
    try {
      if (!location.state) {
        navigate(UnauthorizedRoute);
        return;
      }
      setLoading(true);
      const response = await getUsersWithPositions(siteId).unwrap();
      setData(response);
      setLoading(false);
    } catch (error) {
      AnatomyNotification.error(notification, error);
    }
  };

  useEffect(() => {
    handleGetUsers();
  }, [location.state]);

  const search = useCallback((item: UserCardInfo, query: string): boolean => {
    const normalizedQuery = query.toLowerCase();
    const { name, email, phoneNumber } = item;

    return (
      email.toLowerCase().includes(normalizedQuery) ||
      name.toLowerCase().includes(normalizedQuery) ||
      Boolean(phoneNumber && phoneNumber.toLowerCase().includes(normalizedQuery))
    );
  }, []);

  const filteredData = useMemo(() => {
    if (searchQuery.length > 0) {
      return data.filter((item) => search(item, searchQuery));
    }
    return data;
  }, [searchQuery, data]);

  const handleOnSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleImportUsersData = (data: ImportUsersData) => {
    setImportedUsers(data);
    handleGetUsers();
    setModalOpen(true);
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
      createButtonComponent={
        <UserForm
          formType={UserFormType.CREATE}
          onComplete={() => handleGetUsers()}
        />
      }
      content={
        <div>
          <div className="flex justify-end pb-2 gap-2">
            <ImportUsersButton
              onComplete={(data) => handleImportUsersData(data)}
            />
            <Link
              to={import.meta.env.VITE_IMPORT_USERS_EXCEL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button type="dashed">{Strings.downloadUsersTemplate}</Button>
            </Link>
          </div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={filteredData}
            renderItem={(value: UserCardInfo, index: number) => (
              <List.Item key={index}>
                <UserCard user={value} onComplete={() => handleGetUsers()} />
              </List.Item>
            )}
            loading={isLoading}
          />

          {importedUsers && (
            <Modal
              onOk={() => {
                setModalOpen(false);
                setImportedUsers(null);
              }}
              title={Strings.importUsersSummary}
              open={modalOpen}
              onCancel={() => {
                setModalOpen(false);
                setImportedUsers(null);
              }}
              cancelText={Strings.cancel}
              confirmLoading={isLoading}
              destroyOnHidden
            >
              <div className="flex flex-col gap-2">
                <AnatomySection
                  title={Strings.totalUsersCreated}
                  label={importedUsers.successfullyCreated}
                />
                <AnatomySection
                  title={Strings.totalUsersProcessed}
                  label={importedUsers.totalProcessed}
                />
                <PaginatedList
                  dataSource={importedUsers.processedUsers}
                  responsive={false}
                  renderItem={(value: ImportUser, index: number) => (
                    <div className="m-2">
                      <AnatomySection
                        key={index}
                        title={value.name}
                        label={
                          <div className="flex flex-col">
                            <AnatomySection
                              title={Strings.email}
                              label={value.email}
                            />
                            {validateReason(value.reason) && (
                              <AnatomySection
                                title={Strings.reason}
                                label={value.reason}
                              />
                            )}
                            <AnatomySection
                              title={Strings.registered}
                              label={
                                value.registered ? (
                                  <BsCheckCircle color="green" />
                                ) : (
                                  <BsXCircle color="red" />
                                )
                              }
                            />
                          </div>
                        }
                      />
                    </div>
                  )}
                />
              </div>
            </Modal>
          )}
        </div>
      }
    />
  );
};

export default UsersPage;
