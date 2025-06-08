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
import { Methodology } from "../../../data/charts/charts";
import { useGetMechanicsChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import CustomLegend from "../../../components/CustomLegend";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";
import useDarkMode from "../../../utils/hooks/useDarkMode";

export interface MechanicsChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  methodologies: Methodology[];
  cardTypeName?: string | null;
}

const MechanicsChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
  cardTypeName,
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
    try {
      // Only send basic parameters to API
      const response = await getMechanics({
        siteId,
        startDate,
        endDate,
      }).unwrap();
      
      // Filter data in frontend if card type is selected
      let filteredResponse = response;
      if (cardTypeName) {
        filteredResponse = response.filter(item => 
          item.cardTypeName.toLowerCase() === cardTypeName.toLowerCase()
        );
      }
  
      const mechanicMap: { [key: string]: any } = {};
      filteredResponse.forEach((item: any) => {
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
    } catch (error) {
      console.error('Error fetching mechanics chart data:', error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [startDate, endDate, cardTypeName]);

  // Use dark mode hook to determine text color
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      // Get the mechanic name from the first payload item
      const mechanicName = payload[0]?.payload?.mechanic || '';
      
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
          <p className="font-medium">{mechanicName}</p>
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
          />
          <YAxis 
            tickFormatter={(value: any) => Math.round(Number(value)).toString()}
            allowDecimals={false}
            domain={[0, 'dataMax']}
            tickCount={5}
            scale="linear"
          />
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
                  className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
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
