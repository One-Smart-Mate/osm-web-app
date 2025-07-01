import { useEffect, useState } from "react";
import { useGetAmDiscardReasonsMutation } from "../../services/amDiscardReasonService";
import { AmDiscardReason } from "../../data/amDiscardReason/amDiscardReason";
import { List } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import PaginatedList from "../components/PaginatedList";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import AmDiscardReasonForm, { AmDiscardReasonFormType } from "./components/AmDiscardReasonForm";
import AmDiscardReasonCard from "./components/AmDiscardReasonCard";

const AmDiscardReasonsPage = () => {
  const [getAmDiscardReasons] = useGetAmDiscardReasonsMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<AmDiscardReason[]>([]);
  const [dataBackup, setDataBackup] = useState<AmDiscardReason[]>([]);
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const { isIhAdmin } = useCurrentUser();

  useEffect(() => {
    handleGetAmDiscardReasons();
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

  const search = (item: AmDiscardReason, search: string) => {
    const { discardReason } = item;

    return (
      discardReason.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleGetAmDiscardReasons = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    try {
      const response = await getAmDiscardReasons(location.state.siteId).unwrap();
      
      // Ensure response is an array
      const dataArray = Array.isArray(response) ? response : [];
      
      setData(dataArray);
      setDataBackup(dataArray);
    } catch (error) {
      console.error("Error fetching AM Discard Reasons:", error);
      // Set empty array on error to prevent crash
      setData([]);
      setDataBackup([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer
      title={Strings.amDiscardReasonsOf}
      description={siteName}
      enableCreateButton={true}
      createButtonComponent={
        <AmDiscardReasonForm
          formType={AmDiscardReasonFormType.CREATE}
          onComplete={() => handleGetAmDiscardReasons()}
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
            renderItem={(value: AmDiscardReason, index: number) => (
              <List.Item key={index}>
                <AmDiscardReasonCard
                  amDiscardReason={value}
                  onComplete={() => handleGetAmDiscardReasons()}
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

export default AmDiscardReasonsPage; 