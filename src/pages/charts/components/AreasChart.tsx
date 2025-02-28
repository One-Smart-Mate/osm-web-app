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
import { UserRoles } from "../../../utils/Extensions";
import { useSearchCardsQuery } from "../../../services/cardService";
import CustomLegend from "../../../components/CustomLegend";
import CustomDrawerCardList from "../../../components/CustomDrawerCardList";

export interface ChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  methodologies: Methodology[];
  rol: UserRoles;
}

const AreasChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
  rol,
}: ChartProps) => {
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

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleGetData = async () => {
    const response = await getAreas({
      siteId,
      startDate,
      endDate,
    }).unwrap();
    const areaMap: { [key: string]: any } = {};
    response.forEach((item: any) => {
      if (!areaMap[item.area]) {
        areaMap[item.area] = { area: item.area };
      }
      areaMap[item.area][item.cardTypeName.toLowerCase()] = parseInt(
        item.totalCards,
        10
      );
    });
    const transformedData = Object.values(areaMap);
    setTransformedData(transformedData);
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
    const normalizedCardTypeName = cardTypeName.toLowerCase();
    setSelectedTotalCards(data[normalizedCardTypeName]);
    setAreaName(data.area);
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
        rol={rol}
        text={selectedAreaName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default AreasChart;
