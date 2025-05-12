import { useEffect, useState } from "react";
import { useGetPrioritiesMutation } from "../../services/priorityService";
import { Priority } from "../../data/priority/priority";
import { List } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import PaginatedList from "../../components/PaginatedList";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PriorityForm, { PriorityFormType } from "./components/PriorityForm";
import PriorityCard from "./components/PriorityCard";

const PrioritiesPage = () => {
  const [getPriorities] = useGetPrioritiesMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<Priority[]>([]);
  const [dataBackup, setDataBackup] = useState<Priority[]>([]);
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const { isIhAdmin } = useCurrentUser();

  useEffect(() => {
    handleGetPriorities();
  }, []);

  const handleOnSearch = (query: string) => {
    const getSearch = query;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));
      setData(filterData);
    } else {
      setData(dataBackup);
    }
  };

  const search = (item: Priority, search: string) => {
    const { priorityCode, priorityDescription } = item;

    return (
      priorityCode.toLowerCase().includes(search.toLowerCase()) ||
      priorityDescription.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleGetPriorities = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    const response = await getPriorities(location.state.siteId).unwrap();
    setData(response);
    setDataBackup(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetPriorities();
  }, []);

  return (
    <MainContainer
      title={Strings.prioritiesOf}
      description={siteName}
      enableCreateButton={true}
      createButtonComponent={
        <PriorityForm
          formType={PriorityFormType.CREATE}
          onComplete={() => handleGetPriorities()}
        />
      }
      onSearchChange={handleOnSearch}
      enableSearch={true}
      enableBackButton={isIhAdmin()}
      isLoading={isLoading}
      content={
        <div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={data}
            renderItem={(value: Priority, index: number) => (
              <List.Item key={index}>
                <PriorityCard
                  priority={value}
                  onComplete={() => handleGetPriorities()}
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

export default PrioritiesPage;
