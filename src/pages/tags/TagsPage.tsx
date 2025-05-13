import { useCallback, useEffect, useMemo, useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCardsMutation } from "../../services/cardService";
import { CardInterface } from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { useDebounce } from "use-debounce";
import { handleErrorNotification } from "../../utils/Notifications";
import TagList from "../components/TagList";

const TagsPage = () => {
  const [getCards] = useGetCardsMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<CardInterface[]>([]);
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const { isIhAdmin } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  const handleOnSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const search = useCallback((item: CardInterface, query: string) => {
    const normalizedQuery = query.toLowerCase();
  
    return (
      item.creatorName.toLowerCase().includes(normalizedQuery) ||
      item.areaName.toLowerCase().includes(normalizedQuery) ||
      item.cardTypeMethodologyName.toLowerCase().includes(normalizedQuery)
    );
  }, []);

  const handleGetCards = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    try {
      const response = await getCards(location.state.siteId).unwrap();
      setData(response);
    } catch (error) {
      handleErrorNotification(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetCards();
  }, [location.state]);

  const filteredData = useMemo(() => {
    if (debouncedQuery.length > 0) {
      return data.filter((item) => search(item, debouncedQuery));
    }
    return data;
  }, [debouncedQuery, data]);

  return (
    <MainContainer
      title={Strings.tagsOf}
      description={siteName}
      enableSearch={true}
      enableBackButton={isIhAdmin()}
      isLoading={isLoading}
      onSearchChange={handleOnSearch}
      content={
        <TagList data={filteredData} isLoading={isLoading} isResponsive={true} />
      }
    />
  );
};

export default TagsPage;
