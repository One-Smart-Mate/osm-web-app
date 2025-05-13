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
import { useGetMechanicsChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import CustomLegend from "../../../components/CustomLegend";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";

export interface MechanicsChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  methodologies: Methodology[];
}

const MechanicsChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
}: MechanicsChartProps) => {
  const [getMechanics] = useGetMechanicsChartDataMutation();
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedMechanicName, setSelectedMechanicName] = useState(
    Strings.empty
  );
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    mechanic?: string;
    cardTypeName: string;
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleGetData = async () => {
    const response = await getMechanics({
      siteId,
      startDate,
      endDate,
    }).unwrap();
  
    const mechanicMap: { [key: string]: any } = {};
    response.forEach((item: any) => {
      if (!mechanicMap[item.mechanic]) {
        mechanicMap[item.mechanic] = {
          mechanic: item.mechanic || Strings.noMechanic,
          totalCards: 0, // Initialize totalCards for sorting
        };
      }
      const cardTypeKey = item.cardTypeName.toLowerCase();
      const totalCards = parseInt(item.totalCards, 10);
      mechanicMap[item.mechanic][cardTypeKey] = totalCards;
  
      // Accumulate totalCards for sorting
      mechanicMap[item.mechanic].totalCards += totalCards;
    });
  
    // Transform and sort the data by totalCards in descending order
    const transformedData = Object.values(mechanicMap).sort(
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
      mechanic:
        data.mechanic !== Strings.noMechanic ? data.mechanic : Strings.none,
      cardTypeName: cardTypeName,
    });
    const normalizedCardTypeName = cardTypeName.toLowerCase();
    setSelectedTotalCards(data[normalizedCardTypeName]);
    setSelectedMechanicName(
      data.mechanic !== Strings.noMechanic ? data.mechanic : Strings.none
    );
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
            dataKey={"mechanic"}
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
        label={Strings.mechanic}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        text={selectedMechanicName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default MechanicsChart;
