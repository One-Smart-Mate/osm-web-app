import { useCallback, useEffect, useMemo, useState } from "react";
import { List, App as AntApp, Button } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useGetUsersWithPositionsMutation } from "../../services/userService";
import { UserCardInfo } from "../../data/user/user";
import { useLocation, useNavigate } from "react-router-dom";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import RefreshButton from "../components/RefreshButton";
import PaginatedList from "../components/PaginatedList";
import AnatomyNotification from "../components/AnatomyNotification";
import UserForm from "./components/UserForm";
import { UserFormType } from "./components/UserFormTypes";
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

  const handleGetUsers = async () => {
    try {
      if (!location.state) {
        navigate(UnauthorizedRoute);
        return;
      }
      setLoading(true);
      const response = await getUsersWithPositions(siteId).unwrap();
      // Filter out cancelled users (status 'C') - they should not be visible
      const filteredUsers = response.filter((user: UserCardInfo) => user.status !== 'C');
      setData(filteredUsers);
      setLoading(false);
    } catch (error) {
      AnatomyNotification.error(notification, error);
      setLoading(false);
    }
  };

  // Load users only once when component mounts - removed duplicate
  useEffect(() => {
    handleGetUsers();
  }, [location.state?.siteId]); // Only re-fetch if siteId changes

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
          onComplete={() => {
            // Optimized: reload users list after creation
            // The delay allows the backend to process the user before reloading
            setTimeout(() => handleGetUsers(), 200);
          }}
        />
      }
      content={
        <div>
          <div className="flex justify-end pb-2 gap-2">
            <RefreshButton onRefresh={handleGetUsers} isLoading={isLoading} />
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
            renderItem={(value: UserCardInfo) => (
              <List.Item key={value.id}>
                <UserCard
                  user={value}
                  onComplete={() => {
                    // Optimized: reload users list after update
                    setTimeout(() => handleGetUsers(), 200);
                  }}
                />
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
