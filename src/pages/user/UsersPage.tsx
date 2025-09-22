import { useCallback, useEffect, useMemo, useState } from "react";
import { List, App as AntApp, Button } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useGetUsersWithPositionsMutation } from "../../services/userService";
import { UserCardInfo } from "../../data/user/user";
import { useLocation, useNavigate } from "react-router-dom";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../components/PaginatedList";
import AnatomyNotification from "../components/AnatomyNotification";
import UserForm, { UserFormType } from "./components/UserForm";
import ImportUsersButton from "./components/ImportUsersButton";
import UserCard from "./components/UserCard";
import { ImportUsersData } from "../../data/user/import.users.response";
import { generateUsersExcelTemplate } from "../../utils/generateUsersExcelTemplate";
import { DownloadOutlined } from "@ant-design/icons";

const UsersPage = () => {
  const [getUsersWithPositions] = useGetUsersWithPositionsMutation();
  const [data, setData] = useState<UserCardInfo[]>([]);
  const [isLoading, setLoading] = useState(false);
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

  const handleImportUsersData = (_data: ImportUsersData) => {
    // Just refresh the users list without showing the summary modal
    handleGetUsers();
    // Don't show the modal anymore
    // setImportedUsers(data);
    // setModalOpen(true);
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
          formType={UserFormType._CREATE}
          onComplete={() => handleGetUsers()}
        />
      }
      content={
        <div>
          <div className="flex justify-end pb-2 gap-2">
            <ImportUsersButton
              onComplete={(data) => handleImportUsersData(data)}
            />
            <Button
              type="dashed"
              icon={<DownloadOutlined />}
              onClick={generateUsersExcelTemplate}
            >
              {Strings.downloadUsersTemplate}
            </Button>
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

        </div>
      }
    />
  );
};

export default UsersPage;
