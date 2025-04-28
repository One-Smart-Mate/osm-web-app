import { useEffect, useState } from "react";
import {  List } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCardsMutation } from "../../services/cardService";
import PaginatedList from "../../components/PaginatedList";
import { CardInterface } from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import TagCardV2 from "./components/TagCardV2";
import useCurrentUser from "../../utils/hooks/useCurrentUser";


const TagsV2 = () => {
  const [getCards] = useGetCardsMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<CardInterface[]>([]);
  const [dataBackup, setDataBackup] = useState<CardInterface[]>([]);
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const {isIhAdmin} = useCurrentUser();

  const handleOnSearch = (query: string) => {
    const getSearch = query;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));
      setData(filterData);
    } else {
      setData(dataBackup);
    }
  };

  const search = (item: CardInterface, search: string) => {
    const { creatorName, areaName, cardTypeMethodologyName } = item;

    return (
      creatorName.toLowerCase().includes(search.toLowerCase()) ||
      areaName.toLowerCase().includes(search.toLowerCase()) ||
      cardTypeMethodologyName.toLowerCase().includes(search.toLocaleLowerCase())
    );
  };

  const handleGetCards = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    const response = await getCards(location.state.siteId).unwrap();
    setData(response);
    setDataBackup(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetCards();
  }, [location.state]);


  return (
    <MainContainer
      title={Strings.tagsOf}
      description={siteName}
      enableSearch={true}
      enableBackButton={isIhAdmin()}
      isLoading={isLoading}
      onSearchChange={handleOnSearch}
      content={
        <PaginatedList
          dataSource={data}
          renderItem={(item: CardInterface, index: number) => (
            <List.Item key={index}>
              <TagCardV2 data={item} />
            </List.Item>
          )}
          loading={isLoading}
        />
      }
    />
  );
};

export default TagsV2;