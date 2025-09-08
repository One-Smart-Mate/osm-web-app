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
import { Button } from "antd";
import { SwapOutlined } from "@ant-design/icons";
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
  status?: string;
}

const MechanicsChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
  cardTypeName,
  status,
}: MechanicsChartProps) => {
  const [getMechanics] = useGetMechanicsChartDataMutation();
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedMechanicName, setSelectedMechanicName] = useState(Strings.empty);
  const [selectedCardTypeName, setSelectedCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [selectedCardsData, setSelectedCardsData] = useState<any[]>([]);
  const [isGroupedView, setIsGroupedView] = useState(true); // New state for view toggle
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
        status,
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
          mechanic: category === "Without mechanic" ? Strings.noResponsible : category,
          totalCards: 0,
          cardsData: {},
          allCards: [] // Store all cards for grouped view
        };
        
        // Calculate totals and individual values for on time cards (En tiempo) by card type
        let totalOnTimeCards = 0;
        onTimeSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - En tiempo', '').toLowerCase().replace(/\s/g, '_');
          const dataPoint = serie.data[categoryIndex] || { count: 0, cards: [] };
          const value = dataPoint.count;
          userData[`${cardType}_onTime`] = value;
          userData.cardsData[`${cardType}_onTime`] = dataPoint.cards;
          userData.allCards = userData.allCards.concat(dataPoint.cards); // Add to all cards
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
          userData.allCards = userData.allCards.concat(dataPoint.cards); // Add to all cards
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
        
        // For grouped view, create combined values by methodology
        methodologies.forEach((methodology) => {
          const methodologyKey = methodology.methodology.toLowerCase().replace(/\s/g, '_');
          const onTimeValue = userData[`${methodologyKey}_onTime`] || 0;
          const overdueValue = userData[`${methodologyKey}_overdue`] || 0;
          userData[`${methodologyKey}_combined`] = onTimeValue + overdueValue;
          
          // Combine cards for methodology
          const onTimeCards = userData.cardsData[`${methodologyKey}_onTime`] || [];
          const overdueCards = userData.cardsData[`${methodologyKey}_overdue`] || [];
          userData.cardsData[`${methodologyKey}_combined`] = onTimeCards.concat(overdueCards);
        });
        
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
  }, [startDate, endDate, cardTypeName, status]);

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
          
          {!isGroupedView && (
            <>
              <p className="text-green-500">{Strings.onTimeTags}: {onTimeTotal}</p>
              <p className="text-red-500">{Strings.overdueTags}: {overdueTotal}</p>
            </>
          )}
          
          {/* Show breakdown for methodologies in grouped view */}
          {isGroupedView && (
            <div className="mt-2">
              <p className="font-medium">Detalle por Metodología:</p>
              {methodologies.map((methodology) => {
                const methodologyKey = methodology.methodology.toLowerCase().replace(/\s/g, '_');
                const combinedValue = data[`${methodologyKey}_combined`] || 0;
                if (combinedValue > 0) {
                  return (
                    <div key={methodology.methodology} className="flex items-center gap-2 ml-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: `#${methodology.color}` }}
                      />
                      <span className="text-sm">{methodology.methodology}: {combinedValue}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
          
          {/* Show breakdown for on time cards in separated view */}
          {!isGroupedView && Object.keys(onTimeBreakdown).length > 0 && (
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
          
          {/* Show breakdown for overdue cards in separated view */}
          {!isGroupedView && Object.keys(overdueBreakdown).length > 0 && (
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

  const handleOnClick = (data: any, status?: 'onTime' | 'overdue' | 'combined', cardTypeName?: string) => {
    // Get cards directly from the chart data
    let cards: any[] = [];
    let count = 0;
    let displayName = '';
    
    if (isGroupedView) {
      // Grouped view - show all cards for the methodology
      if (cardTypeName) {
        const cardKey = `${cardTypeName.toLowerCase().replace(/\s/g, '_')}_combined`;
        cards = data.cardsData[cardKey] || [];
        count = data[cardKey] || 0;
        displayName = cardTypeName;
      } else {
        // Show all cards for the user
        cards = data.allCards || [];
        count = data.totalCards || 0;
        displayName = 'Todas';
      }
    } else {
      // Separated view - existing logic
      if (cardTypeName && status) {
        const cardKey = `${cardTypeName.toLowerCase().replace(/\s/g, '_')}_${status}`;
        cards = data.cardsData[cardKey] || [];
        count = data[cardKey] || 0;
        displayName = `${cardTypeName} (${status === 'onTime' ? 'En Tiempo' : 'Vencidas'})`;
      } else if (status) {
        // Get all cards for the status by combining all card types
        const cardKeys = Object.keys(data.cardsData).filter(key => key.endsWith(`_${status}`));
        cards = cardKeys.reduce((allCards: any[], key: string) => {
          return allCards.concat(data.cardsData[key] || []);
        }, []);
        count = status === 'onTime' ? data.onTime_total : data.overdue_total || 0;
        displayName = `Todas (${status === 'onTime' ? 'En Tiempo' : 'Vencidas'})`;
      }
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
    
    setSelectedTotalCards(count.toString());
    setSelectedMechanicName(data.mechanic !== Strings.noMechanic ? data.mechanic : Strings.none);
    setSelectedCardTypeName(displayName);
    
    // Store the enriched cards data to pass to the drawer
    setSelectedCardsData(enrichedCards);
    setOpen(true);
  };

  // Create stacked bars for combined view only
  const createCombinedBars = () => {
    return methodologies.map((methodology) => {
      const dataKey = `${methodology.methodology.toLowerCase().replace(/\s/g, '_')}_combined`;
      
      return (
        <Bar
          key={`${methodology.methodology}_combined`}
          dataKey={dataKey}
          stackId="combined"
          stroke="black"
          strokeWidth={0.5}
          fill={`#${methodology.color}`}
          onClick={(data) => handleOnClick(data, 'combined', methodology.methodology)}
        >
          {transformedData.map((_, index) => (
            <Cell
              key={`cell-${methodology.methodology}-combined-${index}`}
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
    </div>
  );

  // Component for separated view using original logic
  const SeparatedChart = () => (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={transformedData} margin={{ bottom: 80 }}>
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
            label={{ value: Strings.cards, angle: -90, position: 'insideLeft' }}
          />
          <XAxis
            dataKey={"mechanic"}
            angle={-15}
            textAnchor="end"
            className="md:text-sm text-xs"
            dy={14}
          />
          
          {/* Create stacked bars for on time cards */}
          {methodologies.map((methodology) => (
            <Bar
              key={`${methodology.methodology}_onTime`}
              dataKey={`${methodology.methodology.toLowerCase().replace(/\s/g, '_')}_onTime`}
              stackId="onTime"
              stroke="black"
              strokeWidth={0.5}
              fill={`#${methodology.color}`}
              onClick={(data) => handleOnClick(data, 'onTime', methodology.methodology)}
            >
              {transformedData.map((_, index) => (
                <Cell
                  key={`cell-${methodology.methodology}-onTime-${index}`}
                  className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
                />
              ))}
            </Bar>
          ))}
          
          {/* Create stacked bars for overdue cards */}
          {methodologies.map((methodology) => (
            <Bar
              key={`${methodology.methodology}_overdue`}
              dataKey={`${methodology.methodology.toLowerCase().replace(/\s/g, '_')}_overdue`}
              stackId="overdue"
              stroke="black"
              strokeWidth={0.5}
              fill={`#${methodology.color}`}
              onClick={(data) => handleOnClick(data, 'overdue', methodology.methodology)}
            >
              {transformedData.map((_, index) => (
                <Cell
                  key={`cell-${methodology.methodology}-overdue-${index}`}
                  className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Labels positioned above the names */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '95px', 
          left: '0', 
          right: '0', 
          display: 'flex', 
          justifyContent: 'space-around',
          paddingLeft: '60px',
          paddingRight: '20px'
        }}
      >
        {transformedData.map((data, index) => (
          <div key={`label-container-${index}`} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: '80px'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {data.onTime_total > 0 && (
                <span style={{ fontSize: '8px', textAlign: 'center' }}>
                  {Strings.onTimeTags}
                </span>
              )}
              {data.overdue_total > 0 && (
                <span style={{ fontSize: '8px', textAlign: 'center' }}>
                  {Strings.overdueTags}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Toggle Button */}
      <div className="flex justify-end mb-2">
        <Button
          type={isGroupedView ? "default" : "primary"}
          icon={<SwapOutlined />}
          onClick={() => setIsGroupedView(!isGroupedView)}
          size="small"
        >
          {isGroupedView ? "Vista Separada" : "Vista Agrupada"}
        </Button>
      </div>
      
      {/* Grouped Chart */}
      <div style={{ display: isGroupedView ? 'block' : 'none', width: '100%', height: '100%' }}>
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
            label={{ value: Strings.cards, angle: -90, position: 'insideLeft' }}
          />
          <XAxis
            dataKey={"mechanic"}
            angle={-15}
            textAnchor="end"
            className="md:text-sm text-xs"
            dy={14}
          />
          
                    {/* Render combined bars */}
          {createCombinedBars()}
        </BarChart>
      </ResponsiveContainer>
      </div>
      
      {/* Separated Chart */}
      <div style={{ display: isGroupedView ? 'none' : 'block', width: '100%', height: '100%' }}>
        <SeparatedChart />
      </div>
      
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
