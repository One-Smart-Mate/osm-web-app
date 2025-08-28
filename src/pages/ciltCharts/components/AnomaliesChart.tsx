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
import { useGetCiltAnomaliesChartDataMutation, CiltChartFilters } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";
import DrawerCardList from "./DrawerCardList";
import { CardInterface } from "../../../data/card/card";

export interface AnomaliesChartProps {
  filters: CiltChartFilters;
}

const AnomaliesChart = ({ filters }: AnomaliesChartProps) => {
  const [getAnomaliesData] = useGetCiltAnomaliesChartDataMutation();
  const [chartData, setChartData] = useState<any[]>([]);
  // const [rawData, setRawData] = useState<any[]>([]); // Store raw data to access cards - not needed for now
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCards, setSelectedCards] = useState<CardInterface[]>([]);
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  const handleGetData = async () => {
    try {
      const response = await getAnomaliesData(filters).unwrap();
      // setRawData(response); // Store raw data for accessing cards - not needed for now
      
      const transformedData = response.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        }),
        originalDate: item.date, // Keep original date for matching
        asignadas: item.totalAnomalies, // Show total anomalies as "Asignadas"
        relatedCards: item.relatedCards || [], // Store cards for drawer
      }));

      setChartData(transformedData);
    } catch (error) {
      console.error('Error fetching anomalies chart data:', error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [filters]);

  // Handle bar click to open drawer
  const handleBarClick = (data: any) => {
    if (data && data.relatedCards && data.relatedCards.length > 0) {
      setSelectedDate(data.date);
      setSelectedCards(data.relatedCards);
      setDrawerOpen(true);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div 
          className={`py-2 px-4 rounded-md shadow-lg ${textClass}`} 
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <p className="font-medium">{label}</p>
          <p className="text-blue-500">{Strings.assigned}: {data?.asignadas}</p>
          {data?.relatedCards?.length > 0 && (
            <p className="text-green-500 text-xs mt-1">Click to see cards</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={chartData} margin={{ bottom: 60 }}>
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
            label={{ value: Strings.anomaliesDetected, angle: -90, position: 'insideLeft' }}
          />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            className="md:text-sm text-xs"
            height={60}
            interval={0}
          />
          
          <Bar
            dataKey="asignadas"
            fill="#3b82f6"
            name={Strings.assigned}
            onClick={handleBarClick}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-asignadas-${index}`}
                className={`transform transition-transform duration-200 hover:opacity-70 ${
                  entry.relatedCards?.length > 0 ? 'cursor-pointer' : 'cursor-default'
                }`}
              />
            ))}
          </Bar>
          
          <Legend />
        </BarChart>
      </ResponsiveContainer>
      
      <DrawerCardList
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cards={selectedCards}
        isLoading={false}
        title={Strings.anomaliesCiltChart}
        date={selectedDate}
        chartType={Strings.anomalies}
      />
    </>
  );
};

export default AnomaliesChart; 