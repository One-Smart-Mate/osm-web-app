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
import CustomDrawerCardList from "../../../components/CustomDrawerCardList";
import { UserRoles } from "../../../utils/Extensions";

export interface ChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  rol: UserRoles;
  methodologies: Methodology[];
  areaId?: number;
}

const MachinesChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
  rol,
  areaId,
}: ChartProps) => {
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

    if(areaId === undefined) {
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
        };
      }
      nodeMap[item.nodeName][item.cardTypeName.toLowerCase()] = parseInt(
        item.totalCards,
        10
      );
    });
    const transformedData = Object.values(nodeMap);
    
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
          <YAxis />
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
      <CustomDrawerCardList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        rol={rol}
        label={Strings.machine}
        text={selectedMachineName}
        label2={Strings.machineLocation}
        text2={selectedLocation}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default MachinesChart;
