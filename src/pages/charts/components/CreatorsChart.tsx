import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Methodology } from "../../../data/charts/charts";
import { useGetCreatorsChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import CustomLegend from "../../../components/CustomLegend";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";

export interface CreatorsChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  methodologies: Methodology[];
}

const CreatorsChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
}: CreatorsChartProps) => {
  const [getCreators] = useGetCreatorsChartDataMutation();
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCreatorName, setCreatorName] = useState(Strings.empty);
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    creator?: string;
    cardTypeName: string;
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleGetData = async () => {
    const response = await getCreators({
      siteId,
      startDate,
      endDate,
    }).unwrap();
  
    const creatorMap: { [key: string]: any } = {};
    response.forEach((item: any) => {
      if (!creatorMap[item.creator]) {
        creatorMap[item.creator] = {
          creator: item.creator,
          totalCards: 0,
        };
      }
      const cardTypeKey = item.cardTypeName.toLowerCase();
      const totalCards = parseInt(item.totalCards, 10);
      creatorMap[item.creator][cardTypeKey] = totalCards;
      creatorMap[item.creator].totalCards += totalCards;
    });
  
    const transformedData = Object.values(creatorMap).sort(
      (a: any, b: any) => b.totalCards - a.totalCards
    );
  
    setTransformedData(transformedData);
  };

  useEffect(() => {
    handleGetData();
  }, [startDate, endDate]);

  const handleOnClick = (data: any, cardTypeName: string) => {
    setSearchParams({
      siteId,
      creator: data.creator,
      cardTypeName: cardTypeName,
    });
    const normalizedCardTypeName = cardTypeName.toLowerCase();
    setSelectedTotalCards(data[normalizedCardTypeName]);
    setCreatorName(data.creator);
    setCardTypeName(cardTypeName);
    setOpen(true);
  };

  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={transformedData} margin={{ bottom: 50 }}>
          <Legend content={<CustomLegend />} verticalAlign="top" />
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis tickFormatter={(value: any) => Math.round(Number(value)).toString()}/>
          <XAxis
            dataKey={"creator"}
            angle={-15}
            textAnchor="end"
            className="md:text-sm text-xs"
          />
          {methodologies.map((m) => (
            <Bar
              key={m.methodology}
              dataKey={`${m.methodology.toLowerCase()}`}
              stackId="a"
              stroke="black"
              fill={`#${m.color}`}
              onClick={(data) => handleOnClick(data, m.methodology)}
            >
              {transformedData.map((_, index) => (
                <Cell
                  key={`cell-${m.methodology}-${index}`}
                  className="transform transition-transform duration-200  hover:opacity-70 cursor-pointer"
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <DrawerTagList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        label={Strings.creator}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        text={selectedCreatorName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default CreatorsChart;
