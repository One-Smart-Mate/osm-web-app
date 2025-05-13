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
import { useGetAreasChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import { useSearchCardsQuery } from "../../../services/cardService";
import CustomLegend from "../../../components/CustomLegend";
import CustomDrawerCardList from "../../../components/CustomDrawerCardList";

export interface AreasChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  methodologies: Methodology[];
  onClick?: (areaId: number, areaName?: string) => void;
}

const AreasChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
  onClick,
}: AreasChartProps) => {
  const [getAreas] = useGetAreasChartDataMutation();
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedAreaName, setAreaName] = useState(Strings.empty);
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    area?: string;
    cardTypeName: string;
  } | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleGetData = async () => {
    try {
      const response = await getAreas({ siteId, startDate, endDate }).unwrap();
  
      const areaMap: { [key: string]: any } = {};
      response.forEach((item: any) => {
        if (!areaMap[item.area]) {
          areaMap[item.area] = {
            area: item.area,
            areaId: item.areaId,
            totalCards: 0,
          };
        }
        const cardTypeKey = item.cardTypeName.toLowerCase();
        const totalCards = parseInt(item.totalCards, 10);
        areaMap[item.area][cardTypeKey] = totalCards;
        areaMap[item.area].totalCards += totalCards;
      });
        const transformedData = Object.values(areaMap).sort(
        (a: any, b: any) => b.totalCards - a.totalCards
      );
  
      setTransformedData(transformedData);
  
      if (transformedData.length > 0 && areaId == null) {
        const defaultAreaId = transformedData[0].areaId;
        setAreaId(defaultAreaId);
  
        onClick?.(defaultAreaId, transformedData[0].area);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [startDate, endDate]);

  const handleOnClick = (data: any, cardTypeName: string) => {

    setSearchParams({
      siteId,
      area: data.area,
      cardTypeName: cardTypeName,
    });
  
    setAreaId(data.areaId); 
    const normalizedCardTypeName = cardTypeName.toLowerCase();
    setSelectedTotalCards(data[normalizedCardTypeName]);
    setAreaName(data.area);
    setCardTypeName(cardTypeName);
    setOpen(true);
  
    if (data.areaId !== areaId) {
      setAreaId(data.areaId);
      onClick?.(data.areaId, data.area);
    }
  };
  

  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={transformedData} margin={{ bottom: 50 }}>
          <Legend content={<CustomLegend />} verticalAlign="top" />
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis tickFormatter={(value: any) => Math.round(Number(value)).toString()}/>
          <XAxis
            dataKey={"area"}
            angle={-20}
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
      <CustomDrawerCardList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        label={Strings.area}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        text={selectedAreaName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default AreasChart;
