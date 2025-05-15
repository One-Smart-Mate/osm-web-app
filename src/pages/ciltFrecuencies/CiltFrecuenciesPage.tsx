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
import { CiltFrequency } from "../../data/cilt/ciltFrequencies/ciltFrequencies";
import CiltFrequenciesForm, { CiltFrequenciesFormType } from "./components/CiltFrequenciesForm";
import CiltFrequenciesCard from "./components/CiltFrequenciesCard";
import { useGetCiltFrequenciesAllMutation } from "../../services/cilt/ciltFrequenciesService";
import StatusFilterPopover from "./components/StautsFilterPopover";




const CiltFrecuenciesPage = () => {
  const [getCiltFrequenciesAll] = useGetCiltFrequenciesAllMutation();
  const [data, setData] = useState<CiltFrequency[]>([]);
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
    fetchCiltFrequencies();
  }, [location.state]);

  const fetchCiltFrequencies = async () => {
    try {
      if (!location.state) {
        navigate(UnauthorizedRoute);
        return;
      }
      setLoading(true);
      const response = await getCiltFrequenciesAll().unwrap();
      const filteredBySite = response.filter(item => item.siteId === Number(siteId));
      setData(filteredBySite);
      setLoading(false);
    } catch (error) {
      AnatomyNotification.error(notification, error);
    }
  };


  const search = useCallback((item: CiltFrequency, query: string): boolean => {
    const normalizedQuery = query.toLowerCase();
    const { frecuencyCode, description } = item;

    return (
      (frecuencyCode?.toLowerCase().includes(normalizedQuery) ?? false) ||
      (description?.toLowerCase().includes(normalizedQuery) ?? false)
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
      title={Strings.ciltFrecuenciesOf}
      description={siteName}
      isLoading={isLoading}
      enableCreateButton={true}
      enableSearch={true}
      onSearchChange={handleOnSearch}
      enableBackButton={isIhAdmin()}
      createButtonComponent={
        <CiltFrequenciesForm
          formType={CiltFrequenciesFormType.CREATE}
          onComplete={() => fetchCiltFrequencies()}
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
            renderItem={(value: CiltFrequency, index: number) => (
              <List.Item key={index}>
                <CiltFrequenciesCard item={value} onComplete={() => fetchCiltFrequencies()}
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

export default CiltFrecuenciesPage;
