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
import {
  useGetMachinesByAreaIdChartDataMutation,
} from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import { Methodology } from "../../../data/charts/charts";
import CustomLegend from "../../../components/CustomLegend";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";

export interface MachinesChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  methodologies: Methodology[];
  areaId?: number;
}

const MachinesChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
  areaId,
}: MachinesChartProps) => {
  const [getMachines] = useGetMachinesByAreaIdChartDataMutation();
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedMachineName, setSelectedMachineName] = useState(Strings.empty);
  const [selectedLocation, setSelectedLocation] = useState(Strings.empty);
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    nodeName?: string;
    cardTypeName: string;
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleGetData = async () => {

    if (areaId === undefined) {
      return;
    }
  
    const response = await getMachines({
      siteId,
      startDate,
      endDate,
      areaId,
    }).unwrap();
  
    const nodeMap: { [key: string]: any } = {};
    response.forEach((item: any) => {
      if (!nodeMap[item.nodeName]) {
        nodeMap[item.nodeName] = {
          nodeName: item.nodeName,
          location: item.location,
          totalCards: 0,
        };
      }
      const cardTypeKey = item.cardTypeName.toLowerCase();
      const totalCards = parseInt(item.totalCards, 10);
      nodeMap[item.nodeName][cardTypeKey] = totalCards;
        nodeMap[item.nodeName].totalCards += totalCards;
    });
  
    const transformedData = Object.values(nodeMap).sort(
      (a: any, b: any) => b.totalCards - a.totalCards
    );
  
    setTransformedData(transformedData);
  };
  useEffect(() => {
    handleGetData();
  }, [startDate, endDate,areaId]);

  const handleOnClick = (data: any, cardTypeName: string) => {
    setSearchParams({
      siteId,
      nodeName: data.nodeName,
      cardTypeName: cardTypeName,
    });
    const normalizedCardTypeName = cardTypeName.toLowerCase();
    setSelectedTotalCards(data[normalizedCardTypeName]);
    setSelectedMachineName(data.nodeName);
    setSelectedLocation(data.location);
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
            dataKey={"nodeName"}
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
      <DrawerTagList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        label={Strings.machine}
        text={selectedMachineName}
        subLabel={Strings.machineLocation}
        subText={selectedLocation}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default MachinesChart;
