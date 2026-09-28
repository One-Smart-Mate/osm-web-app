import { useEffect, useState } from "react";
import { useGetAmDiscardReasonsQuery } from "../../services/amDiscardReasonService";
import { AmDiscardReason } from "../../data/amDiscardReason/amDiscardReason";
import { List } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useLocation } from "react-router-dom";
import PaginatedList from "../components/PaginatedList";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import RefreshButton from "../components/RefreshButton";
import AmDiscardReasonForm, { AmDiscardReasonFormType } from "./components/AmDiscardReasonForm";
import AmDiscardReasonCard from "./components/AmDiscardReasonCard";

const AmDiscardReasonsPage = () => {
  const location = useLocation();
  const [data, setData] = useState<AmDiscardReason[]>([]);
  const [dataBackup, setDataBackup] = useState<AmDiscardReason[]>([]);
  const siteName = location?.state?.siteName || Strings.empty;
  const { isIhAdmin } = useCurrentUser();
  
  // Get discard reasons using the query hook
  const { data: amDiscardReasons = [], isLoading, refetch } = useGetAmDiscardReasonsQuery(
    location?.state?.siteId ? Number(location.state.siteId) : 0,
    { skip: !location?.state?.siteId }
  );

  useEffect(() => {
    setData(amDiscardReasons);
    setDataBackup(amDiscardReasons);
  }, [amDiscardReasons]);

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

  const handleRefresh = () => {
    // Force a fresh fetch from the server (create/update/delete also invalidate
    // the AmDiscardReason tag, so the list re-fetches automatically too).
    refetch();
  };

  return (
    <MainContainer
      title={Strings.amDiscardReasonsOf}
      description={siteName}
      enableCreateButton={true}
      createButtonComponent={
        <AmDiscardReasonForm
          formType={AmDiscardReasonFormType._CREATE}
          onComplete={() => handleRefresh()}
        />
      }
      onSearchChange={handleOnSearch}
      enableSearch={true}
      enableBackButton={isIhAdmin()}
      isLoading={isLoading}
      content={
        <div>
          <div className="flex justify-end mb-2">
            <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />
          </div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={data}
            renderItem={(value: AmDiscardReason, index: number) => (
              <List.Item key={index}>
                <AmDiscardReasonCard
                  amDiscardReason={value}
                  onComplete={() => handleRefresh()}
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