import { useEffect, useState, useMemo } from "react";
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
  const [selectedMechanicName, setSelectedMechanicName] = useState(
    Strings.empty
  );
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [, setSelectedTotalCards] = useState(Strings.empty);
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'closed' | null>(null);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    mechanic?: string;
    cardTypeName: string;
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  // Filter search data by selected status
  const filteredSearchData = useMemo(() => {
    if (!searchData || !selectedStatus) return searchData;
    
    // Map status to card status values
    const statusMap = {
      'open': 'A', // Assuming 'A' means open/active
      'closed': 'C/R' // Assuming 'C/R' means closed/resolved
    };
    
    const targetStatus = statusMap[selectedStatus];
    const filtered = searchData.filter(card => {
      // Handle both 'C/R' as a single status or separate 'C' and 'R' statuses
      if (selectedStatus === 'closed') {
        return card.status === 'C/R' || card.status === 'C' || card.status === 'R';
      }
      return card.status === targetStatus;
    });
    
    return filtered;
  }, [searchData, selectedStatus]);

  // Calculate actual total from filtered data
  const actualTotalCards = useMemo(() => {
    return filteredSearchData ? filteredSearchData.length.toString() : '0';
  }, [filteredSearchData]);

  const handleGetData = async () => {
    try {
      const response = await getMechanics({
        siteId,
        startDate,
        endDate,
      }).unwrap();

      console.log("AAAAAAAAAAAAAAAAAAAAAA", response);

      // Cast response to the new structure since the API now returns the new format
      const chartData = response as any as {
        categories: string[];
        series: Array<{
          name: string;
          data: number[];
        }>;
      };
      
      // Transform the new data structure
      const { categories, series } = chartData;
      
      // Group series by card type and status (A for open, C/R for closed)
      const openSeries = series.filter((s: any) => s.name.includes(' - A'));
      const closedSeries = series.filter((s: any) => s.name.includes(' - C/R)'));
      
      // Create transformed data for each category (user)
      const transformedData = categories.map((category: string, categoryIndex: number) => {
        const userData: any = {
          mechanic: category,
          totalCards: 0,
        };
        
        // Calculate totals and individual values for open cards (A) by card type
        let totalOpenCards = 0;
        openSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - A', '').toLowerCase().replace(/\s/g, '_');
          const value = serie.data[categoryIndex] || 0;
          userData[`${cardType}_open`] = value;
          totalOpenCards += value;
        });
        userData.open_total = totalOpenCards;
        
        // Calculate totals and individual values for closed cards (C/R) by card type  
        let totalClosedCards = 0;
        closedSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - C/R)', '').toLowerCase().replace(/\s/g, '_');
          const value = serie.data[categoryIndex] || 0;
          userData[`${cardType}_closed`] = value;
          totalClosedCards += value;
        });
        userData.closed_total = totalClosedCards;
        
        // Store breakdown by type for tooltip
        userData.breakdown = {
          open: {},
          closed: {}
        };
        
        // Store open breakdown by type
        openSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - A', '');
          const value = serie.data[categoryIndex] || 0;
          if (value > 0) {
            userData.breakdown.open[cardType] = value;
          }
        });
        
        // Store closed breakdown by type
        closedSeries.forEach((serie: any) => {
          const cardType = serie.name.replace(' - C/R)', '');
          const value = serie.data[categoryIndex] || 0;
          if (value > 0) {
            userData.breakdown.closed[cardType] = value;
          }
        });
        
        userData.totalCards = totalOpenCards + totalClosedCards;
        
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
      const openTotal = data?.open_total || 0;
      const closedTotal = data?.closed_total || 0;
      const totalCards = openTotal + closedTotal;
      
      // Get breakdown data
      const openBreakdown = data?.breakdown?.open || {};
      const closedBreakdown = data?.breakdown?.closed || {};
      
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
          <p className="text-green-500">{Strings.openTags}: {openTotal}</p>
          <p className="text-blue-500">{Strings.closedTags}: {closedTotal}</p>
          
          {/* Show breakdown for open cards */}
          {Object.keys(openBreakdown).length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-green-500">Detalle Abiertas:</p>
              {Object.entries(openBreakdown).map(([type, value]: [string, any]) => {
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
          
          {/* Show breakdown for closed cards */}
          {Object.keys(closedBreakdown).length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-blue-500">Detalle Cerradas:</p>
              {Object.entries(closedBreakdown).map(([type, value]: [string, any]) => {
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

  const handleOnClick = (data: any, status: 'open' | 'closed', cardTypeName?: string) => {
    // If specific card type is clicked, filter by that type
    // If general bar is clicked, show all types for that status
    const searchCardType = cardTypeName || 'all';
    
    setSearchParams({
      siteId,
      mechanic: data.mechanic !== Strings.noMechanic ? data.mechanic : Strings.none,
      cardTypeName: searchCardType,
    });
    
    // Store the selected status for filtering
    setSelectedStatus(status);
    
    setSelectedTotalCards(
      cardTypeName 
        ? data[`${cardTypeName.toLowerCase().replace(/\s/g, '_')}_${status}`]?.toString() || '0'
        : (status === 'open' ? data.open_total : data.closed_total)?.toString() || '0'
    );
    setSelectedMechanicName(data.mechanic !== Strings.noMechanic ? data.mechanic : Strings.none);
    setCardTypeName(cardTypeName || `Todas (${status === 'open' ? 'Abiertas' : 'Cerradas'})`);
    setOpen(true);
  };

  // Create stacked bars for each status (open/closed)
  const createStackedBars = (status: 'open' | 'closed') => {
    return methodologies.map((methodology) => {
      const dataKey = `${methodology.methodology.toLowerCase().replace(/\s/g, '_')}_${status}`;
      
      return (
        <Bar
          key={`${methodology.methodology}_${status}`}
          dataKey={dataKey}
          stackId={status} // Stack by status (open/closed)
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
          <span className="text-xs">{Strings.openTags}</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-xs">{Strings.closedTags}</span>
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
          
          {/* Create stacked bars for open cards */}
          {createStackedBars('open')}
          
          {/* Create stacked bars for closed cards */}
          {createStackedBars('closed')}
        </BarChart>
      </ResponsiveContainer>
      <DrawerTagList
        open={open}
        dataSource={filteredSearchData}
        isLoading={isFetching}
        label={Strings.mechanic}
        onClose={() => setOpen(false)}
        totalCards={actualTotalCards}
        text={selectedMechanicName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default MechanicsChart;
