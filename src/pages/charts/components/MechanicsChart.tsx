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
  const [selectedMechanicName, setSelectedMechanicName] = useState(Strings.empty);
  const [selectedCardTypeName, setSelectedCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [selectedCardsData, setSelectedCardsData] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    mechanicName?: string;
    cardTypeName: string;
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleGetData = async () => {
    try {
      const response = await getMechanics({
        siteId,
        startDate,
        endDate,
      }).unwrap();

      // Cast response to the new structure since the API now returns the new format
      const chartData = response as any as {
        categories: string[];
        series: Array<{
          name: string;
          data: Array<{
            count: number;
            cards: any[];
          }>;
        }>;
      };
      
      // Transform the new data structure
      const { categories, series } = chartData;
      
      // Group series by card type and status (En tiempo for on time, Vencidas for overdue)
      const onTimeSeries = series.filter((s: any) => s.name.includes(' - En tiempo'));
      const overdueSeries = series.filter((s: any) => s.name.includes(' - Vencidas'));
      
      // Create transformed data for each category (user)
      const transformedData = categories.map((category: string, categoryIndex: number) => {
        const userData: any = {
          mechanic: category,
          totalCards: 0,
          cardsData: {}
        };
        
        // Calculate totals and individual values for on time cards (En tiempo) by card type
        let totalOnTimeCards = 0;
        onTimeSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - En tiempo', '').toLowerCase().replace(/\s/g, '_');
          const dataPoint = serie.data[categoryIndex] || { count: 0, cards: [] };
          const value = dataPoint.count;
          userData[`${cardType}_onTime`] = value;
          userData.cardsData[`${cardType}_onTime`] = dataPoint.cards;
          totalOnTimeCards += value;
        });
        userData.onTime_total = totalOnTimeCards;
        
        // Calculate totals and individual values for overdue cards (Vencidas) by card type  
        let totalOverdueCards = 0;
        overdueSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - Vencidas', '').toLowerCase().replace(/\s/g, '_');
          const dataPoint = serie.data[categoryIndex] || { count: 0, cards: [] };
          const value = dataPoint.count;
          userData[`${cardType}_overdue`] = value;
          userData.cardsData[`${cardType}_overdue`] = dataPoint.cards;
          totalOverdueCards += value;
        });
        userData.overdue_total = totalOverdueCards;
        
        // Store breakdown by type for tooltip
        userData.breakdown = {
          onTime: {},
          overdue: {}
        };
        
        // Store on time breakdown by type
        onTimeSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - En tiempo', '');
          const dataPoint = serie.data[categoryIndex] || { count: 0, cards: [] };
          const value = dataPoint.count;
          if (value > 0) {
            userData.breakdown.onTime[cardType] = value;
          }
        });
        
        // Store overdue breakdown by type
        overdueSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - Vencidas', '');
          const dataPoint = serie.data[categoryIndex] || { count: 0, cards: [] };
          const value = dataPoint.count;
          if (value > 0) {
            userData.breakdown.overdue[cardType] = value;
          }
        });
        
        userData.totalCards = totalOnTimeCards + totalOverdueCards;
        
        return userData;
      });

      // Sort by total cards in descending order
      const sortedData = transformedData.sort((a: any, b: any) => b.totalCards - a.totalCards);
      
      setTransformedData(sortedData);
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
      const mechanicName = payload[0]?.payload?.mechanic || '';
      const data = payload[0]?.payload;
      
      // Get totals
      const onTimeTotal = data?.onTime_total || 0;
      const overdueTotal = data?.overdue_total || 0;
      const totalCards = onTimeTotal + overdueTotal;
      
      // Get breakdown data
      const onTimeBreakdown = data?.breakdown?.onTime || {};
      const overdueBreakdown = data?.breakdown?.overdue || {};
      
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
          <p className="text-green-500">{Strings.onTimeTags}: {onTimeTotal}</p>
          <p className="text-red-500">{Strings.overdueTags}: {overdueTotal}</p>
          
          {/* Show breakdown for on time cards */}
          {Object.keys(onTimeBreakdown).length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-green-500">Detalle En Tiempo:</p>
              {Object.entries(onTimeBreakdown).map(([type, value]: [string, any]) => {
                const methodology = methodologies.find(m => 
                  m.methodology.toLowerCase() === type.toLowerCase()
                );
                return (
                  <div key={type} className="flex items-center gap-2 ml-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: methodology ? `#${methodology.color}` : '#gray' }}
                    />
                    <span className="text-sm">{type}: {value}</span>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Show breakdown for overdue cards */}
          {Object.keys(overdueBreakdown).length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-500">Detalle Vencidas:</p>
              {Object.entries(overdueBreakdown).map(([type, value]: [string, any]) => {
                const methodology = methodologies.find(m => 
                  m.methodology.toLowerCase() === type.toLowerCase()
                );
                return (
                  <div key={type} className="flex items-center gap-2 ml-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: methodology ? `#${methodology.color}` : '#gray' }}
                    />
                    <span className="text-sm">{type}: {value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleOnClick = (data: any, status: 'onTime' | 'overdue', cardTypeName?: string) => {
    // Get cards directly from the chart data
    let cards: any[] = [];
    if (cardTypeName) {
      // Get cards for specific card type
      const cardKey = `${cardTypeName.toLowerCase().replace(/\s/g, '_')}_${status}`;
      cards = data.cardsData[cardKey] || [];
    } else {
      // Get all cards for the status by combining all card types
      const cardKeys = Object.keys(data.cardsData).filter(key => key.endsWith(`_${status}`));
      cards = cardKeys.reduce((allCards: any[], key: string) => {
        return allCards.concat(data.cardsData[key] || []);
      }, []);
    }

    // Add missing fields to each card
    const enrichedCards = cards.map(card => {
      return {
        ...card,
        cardTypeName: card.cardTypeMethodologyName || 'Unknown', // Add cardTypeName if missing
        siteId: String(card.siteId || siteId) // Use card.siteId or fallback to component siteId
      };
    });

    // Set the enriched cards data directly without making API call
    setSearchParams(null); // Clear search params since we're using direct data
    
    // Get the count from the chart data
    const count = cardTypeName 
      ? data[`${cardTypeName.toLowerCase().replace(/\s/g, '_')}_${status}`] || 0
      : (status === 'onTime' ? data.onTime_total : data.overdue_total) || 0;
    
    setSelectedTotalCards(count.toString());
    setSelectedMechanicName(data.mechanic !== Strings.noMechanic ? data.mechanic : Strings.none);
    setSelectedCardTypeName(cardTypeName || `Todas (${status === 'onTime' ? 'En Tiempo' : 'Vencidas'})`);
    
    // Store the enriched cards data to pass to the drawer
    setSelectedCardsData(enrichedCards);
    setOpen(true);
  };

  // Create stacked bars for each status (onTime/overdue)
  const createStackedBars = (status: 'onTime' | 'overdue') => {
    return methodologies.map((methodology) => {
      const dataKey = `${methodology.methodology.toLowerCase().replace(/\s/g, '_')}_${status}`;
      
      return (
        <Bar
          key={`${methodology.methodology}_${status}`}
          dataKey={dataKey}
          stackId={status} // Stack by status (onTime/overdue)
          stroke="black"
          strokeWidth={0.5}
          fill={`#${methodology.color}`}
          onClick={(data) => handleOnClick(data, status, methodology.methodology)}
        >
          {transformedData.map((_, index) => (
            <Cell
              key={`cell-${methodology.methodology}-${status}-${index}`}
              className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
            />
          ))}
        </Bar>
      );
    });
  };

  // Custom legend component for methodologies only
  const MethodologiesLegend = () => (
    <div className="flex justify-center flex-wrap gap-2 mb-2">
      {methodologies.map((methodology, index) => (
        <div key={index} className="flex gap-1 items-center">
          <div
            className="w-5 h-4 md:h-5 rounded-lg border border-black"
            style={{
              background: `#${methodology.color}`,
            }}
          />
          <h1 className="md:text-sm text-xs">
            {methodology.methodology}
          </h1>
        </div>
      ))}
      <div className="flex gap-4 ml-4">
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-xs">{Strings.onTimeTags}</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-xs">{Strings.overdueTags}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={transformedData} margin={{ bottom: 50 }}>
          <Legend content={<MethodologiesLegend />} verticalAlign="top" />
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
          
          {/* Create stacked bars for on time cards */}
          {createStackedBars('onTime')}
          
          {/* Create stacked bars for overdue cards */}
          {createStackedBars('overdue')}
        </BarChart>
      </ResponsiveContainer>
      <DrawerTagList
        open={open}
        dataSource={selectedCardsData.length > 0 ? selectedCardsData : searchData}
        isLoading={selectedCardsData.length > 0 ? false : isFetching}
        label={Strings.mechanic}
        onClose={() => {
          setOpen(false);
          setSelectedCardsData([]);
          setSearchParams(null);
        }}
        totalCards={selectedTotalCards}
        text={selectedMechanicName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default MechanicsChart;
