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
  Tooltip,
  TooltipProps,
} from "recharts";
import {
  useGetMachinesByAreaIdChartDataMutation,
} from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import { Methodology } from "../../../data/charts/charts";
import CustomLegend from "../../../components/CustomLegend";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";
import useDarkMode from "../../../utils/hooks/useDarkMode";

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

  // Use dark mode hook to determine text color
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      // Get the machine name from the first payload item
      const machineName = payload[0]?.payload?.nodeName || '';
      
      // Calculate total cards across all methodologies
      let totalCards = 0;
      const methodologyValues: {name: string, value: number, color: string}[] = [];
      
      // Process each payload item (one per methodology)
      payload.forEach(entry => {
        if (entry && entry.value) {
          const methodName = entry.dataKey as string;
          const value = Number(entry.value);
          totalCards += value;
          
          // Find the color for this methodology
          const methodology = methodologies.find(m => 
            m.methodology.toLowerCase() === methodName
          );
          
          if (methodology && value > 0) {
            methodologyValues.push({
              name: methodology.methodology,
              value: value,
              color: methodology.color
            });
          }
        }
      });
      
      
      
      return (
        <div 
          className={`py-2 px-4 rounded-md shadow-lg ${textClass}`} 
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            transform: 'translateX(-100%)'
          }}
        >
          <p className="font-medium">{machineName}</p>
          <p>{Strings.totalCards}: {totalCards}</p>
          {methodologyValues.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: `#${item.color}` }}
              />
              <span>{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={false}
            isAnimationActive={false}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ 
              zIndex: 9999, 
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
            }}
            // Position adjustment is now handled in the CustomTooltip component
            // to prevent overflow at screen edges
          />
          <YAxis 
            tickFormatter={(value: any) => Math.floor(Number(value)).toString()}
            allowDecimals={false}
            // Set domain to use more vertical space
            domain={[0, (dataMax: number) => Math.max(5, dataMax * 1.2)]}
            // Use dynamic ticks based on data
            ticks={(() => {
              const maxValue = Math.max(...transformedData.map(item => item.totalCards || 0));
              const tickCount = 5;
              const step = Math.ceil(maxValue / (tickCount - 1));
              return Array.from({length: tickCount}, (_, i) => i * step);
            })()}
          />
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
