import { useEffect, useState } from "react";
import {  List } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCardsMutation } from "../../services/cardService";
import PaginatedList from "../../components/PaginatedList";
import InformationPanel from "./components/Card";
import { CardInterface } from "../../data/card/card";
import {  UserRoles } from "../../utils/Extensions";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../../pagesRedesign/layout/MainContainer";

interface CardsProps {
  rol: UserRoles;
}

const Cards = ({ rol }: CardsProps) => {
  const [getCards] = useGetCardsMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<CardInterface[]>([]);
  const [dataBackup, setDataBackup] = useState<CardInterface[]>([]);
  const navigate = useNavigate();

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

  const siteName = location?.state?.siteName || Strings.empty;

  return (
    <MainContainer
      title={Strings.tagsOf}
      description={siteName}
      enableSearch={true}
      isLoading={isLoading}
      onSearchChange={handleOnSearch}
      content={
        <PaginatedList
          dataSource={data}
          renderItem={(item: CardInterface, index: number) => (
            <List.Item>
              <InformationPanel key={index} data={item} rol={rol} />
            </List.Item>
          )}
          loading={isLoading}
        />
      }
    />
  );
};

export default Cards;
