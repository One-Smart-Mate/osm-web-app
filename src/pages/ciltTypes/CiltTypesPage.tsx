import { useCallback, useEffect, useMemo, useState } from "react";
import {
  List,
  App as AntApp,
} from "antd";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../components/PaginatedList";
import AnatomyNotification from "../components/AnatomyNotification";
import { useGetCiltTypesAllMutation } from "../../services/cilt/ciltTypesService";
import { CiltType } from "../../data/cilt/ciltTypes/ciltTypes";
import CiltTypesForm, { CiltTypesFormType } from "./components/CiltTypesForm";
import StatusFilterPopover from "../ciltFrecuencies/components/StautsFilterPopover";
import CiltTypesCard from "./components/CiltTypesCard";




const CiltTypesPage = () => {
  const [getCiltTypesAll] = useGetCiltTypesAllMutation();
  const [data, setData] = useState<CiltType[]>([]);
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isIhAdmin } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState<string>(Strings.empty);
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state.siteId || Strings.empty;
  const { notification } = AntApp.useApp();
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);


  useEffect(() => {
    fetchCiltTypes();
  }, [location.state]);

  const fetchCiltTypes = async () => {
    try {
      if (!location.state) {
        navigate(UnauthorizedRoute);
        return;
      }
      setLoading(true);
      const response = await getCiltTypesAll().unwrap();
      const filteredBySite = response.filter(item => item.siteId === Number(siteId));
      setData(filteredBySite);
      setLoading(false);
    } catch (error) {
      AnatomyNotification.error(notification, error);
    }
  };


  const search = useCallback((item: CiltType, query: string): boolean => {
    const normalizedQuery = query.toLowerCase();
    const { name, color } = item;

    return (
      (name?.toLowerCase().includes(normalizedQuery) ?? false) ||
      (color?.toLowerCase().includes(normalizedQuery) ?? false)
    );
  }, []);

  const filteredData = useMemo(() => {
    let result = data;
  
    if (statusFilter !== null) {
      result = result.filter((item) =>
        statusFilter ? item.status === Strings.activeValue : item.status === Strings.inactiveValue
      );
    }
  
    if (searchQuery.length > 0) {
      result = result.filter((item) => search(item, searchQuery));
    }
  
    return result;
  }, [searchQuery, data, statusFilter]);

  const handleOnSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <MainContainer
      title={Strings.ciltTypesOf}
      description={siteName}
      isLoading={isLoading}
      enableCreateButton={true}
      enableSearch={true}
      onSearchChange={handleOnSearch}
      enableBackButton={isIhAdmin()}
      createButtonComponent={
        <CiltTypesForm
          formType={CiltTypesFormType._CREATE}
          onComplete={() => fetchCiltTypes()}
        />
      }
      content={
        <div>
          <div className="flex justify-end pb-2">
            <StatusFilterPopover
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

          </div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={filteredData}
            renderItem={(value: CiltType, index: number) => (
              <List.Item key={index}>
                <CiltTypesCard item={value} onComplete={() => fetchCiltTypes()}
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

export default CiltTypesPage;
