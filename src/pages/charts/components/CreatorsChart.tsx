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
import { useGetCreatorsChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import CustomLegend from "../../../components/CustomLegend";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";
import useDarkMode from "../../../utils/hooks/useDarkMode";

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

  // Use dark mode hook to determine text color
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, coordinate }: TooltipProps<number, string> & { coordinate?: { x: number, y: number } }) => {
    if (active && payload && payload.length) {
      // Get the creator name from the first payload item
      const creatorName = payload[0]?.payload?.creator || '';
      
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
      
      // Determine if tooltip should be positioned to the left instead of right
      // based on the x coordinate to prevent overflow
      const isNearRightEdge = coordinate && coordinate.x > window.innerWidth - 200;
      
      return (
        <div 
          className={`py-2 px-4 rounded-md shadow-lg ${textClass}`} 
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            transform: isNearRightEdge ? 'translateX(-100%)' : 'none'
          }}
        >
          <p className="font-medium">{creatorName}</p>
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
            tickFormatter={(value: any) => Math.round(Number(value)).toString()}
            allowDecimals={false}
            domain={[0, 'dataMax']}
            // Fix for duplicate tick values on y-axis by using a custom tick count
            tickCount={5}
            scale="linear"
          />
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
