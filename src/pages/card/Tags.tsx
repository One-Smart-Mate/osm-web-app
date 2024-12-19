import { useEffect, useState } from "react";
import { Input, List, Button } from "antd";
import { IoIosSearch } from "react-icons/io";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitleTag from "../../components/PageTitleTag";
import { useGetCardsMutation } from "../../services/cardService";
import PaginatedList from "../../components/PaginatedList";
import InformationPanel from "./components/Tag";
import { CardInterface } from "../../data/card/card";
import { UserRoles } from "../../utils/Extensions";
import { UnauthorizedRoute } from "../../utils/Routes";

interface CardsProps {
  rol: UserRoles;
}

const Tags = ({ rol }: CardsProps) => {
  const [getCards] = useGetCardsMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<CardInterface[]>([]);
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<CardInterface[]>([]);
  const navigate = useNavigate();

  const handleOnSearch = (event: any) => {
    const getSearch = event.target.value;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));
      setData(filterData);
    } else {
      setData(dataBackup);
    }
    setQuerySearch(getSearch);
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
    <>
    
      <div className="h-full flex flex-col">
  
      
        <div className="flex flex-col m-4">
  
          <div className="m-4 mb-6"> 
            <PageTitleTag mainText={Strings.tagsOf} subText={siteName}/>
          </div>
  
          
          <div className="flex items-center space-x-4 m-4 mb-6"> 
           
            <Input
              className="w-full h-8 px-8 text-lg"
              onChange={handleOnSearch}
              value={querySearch}
              addonAfter={<IoIosSearch />}
            />  
  

            <Button
   
              size="large" 
              className="w-64 h-8 px-8 text-lg" 
              type="primary"
              htmlType="submit"
            >
              {Strings.filters}
            </Button>
  
          </div>
  
        </div>  

    
        <div className="flex-1 overflow-y-auto overflow-x-clip">

          <PaginatedList
            dataSource={data}
            renderItem={(item: CardInterface, index: number) => (
              <List.Item>
      
    
                <InformationPanel key={index} data={item} rol={rol} />
              </List.Item>
            )}
            loading={isLoading}
          />
        </div> 
  
      </div> 
    </>
  );
  
};

export default Tags;
