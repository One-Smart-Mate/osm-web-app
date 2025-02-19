import { useEffect, useState } from "react";
import { Input, List } from "antd";
import { IoIosSearch, IoIosClose } from "react-icons/io";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitleTag from "../../components/PageTitleTag";
import { useGetCardsMutation } from "../../services/cardService";
import PaginatedList from "../../components/PaginatedList";
import InformationPanel from "./components/Tag";
import { CardInterface } from "../../data/card/card";
import { UserRoles } from "../../utils/Extensions";
import { UnauthorizedRoute } from "../../utils/Routes";
import AnatomyButton from "../../components/AnatomyButton";

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

  const handleClearSearch = () => {
    setQuerySearch(Strings.empty); // Clear the input state.
    setData(dataBackup); // Restore the original data.
  };

  const statusMapping: { [key: string]: string[] } = {
    A: ["abierto", "open"],
    R: ["cerrado", "closed"],
  };
  
  const search = (item: CardInterface, search: string) => {
    const { 
      responsableName, cardLocation, cardTypeName, 
      cardDueDate, cardCreationDate, siteCardId, 
      status, creatorName, areaName, cardTypeMethodologyName 
    } = item;
  
   // If the state exists in the mapping, convert it to a string; otherwise, use the original value.
    const statusText = statusMapping[status]?.join(" ").toLowerCase() || status.toLowerCase();  
  
    return (
      String(siteCardId).toLowerCase().includes(search.toLowerCase()) ||
      (cardCreationDate && cardCreationDate.toString().toLowerCase().includes(search.toLowerCase())) ||
      (cardDueDate && cardDueDate.toString().toLowerCase().includes(search.toLowerCase())) ||
      (responsableName?.toLowerCase().includes(search.toLowerCase()) || "") ||
      cardLocation.toLowerCase().includes(search.toLowerCase()) ||
      cardTypeName.toLowerCase().includes(search.toLowerCase()) ||
      statusText.includes(search.toLowerCase()) || 
      creatorName.toLowerCase().includes(search.toLowerCase()) ||
      areaName.toLowerCase().includes(search.toLowerCase()) ||
      cardTypeMethodologyName.toLowerCase().includes(search.toLowerCase())
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
            <PageTitleTag mainText={Strings.tagsOf} subText={siteName} />
          </div>


          <div className="flex items-center space-x-4 m-4 mb-6">

          <Input
            className="w-full h-8 px-8 text-lg"
            onChange={handleOnSearch}
            value={querySearch}
// Use of 'suffix' to add an icon to the right end of the input.
            suffix={
              querySearch ? ( // If there is text in the input, show the "X" to clear.
                <IoIosClose
                  className="cursor-pointer text-xl" // The icon becomes clickable.
                  onClick={handleClearSearch} // When clicked, the function to clear the content is executed.
                />
              ) : (
                <IoIosSearch className="text-xl" /> // If the input is empty, show the search icon.
              )
            }
          />

            <AnatomyButton
              title={Strings.filters}
              onClick={() => { }}
              type="default"
              size="large"
              htmlType="submit"
              className="w-64 h-8 px-8 text-lg"
            />

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
