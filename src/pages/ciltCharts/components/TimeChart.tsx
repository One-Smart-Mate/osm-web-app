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
import { useGetCiltTimeChartDataMutation, CiltChartFilters } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";

export interface TimeChartProps {
  filters: CiltChartFilters;
}

const TimeChart = ({ filters }: TimeChartProps) => {
  const [getTimeData] = useGetCiltTimeChartDataMutation();
  const [chartData, setChartData] = useState<any[]>([]);
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  // Format time from minutes to mm:ss format (exact format, no rounding)
  const formatTimeFromMinutes = (minutes: number | null) => {
    if (minutes === null || minutes === undefined) return "0:00";
    
    const totalMinutes = Math.floor(minutes);
    const seconds = Math.floor((minutes - totalMinutes) * 60);
    
    return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGetData = async () => {
    try {
      const response = await getTimeData(filters).unwrap();
      
      const transformedData = response.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        }),
        standardTimeMinutes: item.standardTimeMinutes,
        realTimeMinutes: item.realTimeMinutes,
        executedCount: item.executedCount,
        efficiencyPercentage: item.efficiencyPercentage,
        // Formatted display values
        standardTimeDisplay: formatTimeFromMinutes(item.standardTimeMinutes),
        realTimeDisplay: formatTimeFromMinutes(item.realTimeMinutes),
      }));

      setChartData(transformedData);
    } catch (error) {
      console.error('Error fetching time chart data:', error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [filters]);

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
          <p className="text-blue-500">Tiempo STD: {data?.standardTimeDisplay}</p>
          <p className="text-orange-500">Ejecutado: {data?.realTimeDisplay}</p>
          <p className="text-gray-500">Ejecutados: {data?.executedCount}</p>
          <p className="text-green-500">Eficiencia: {data?.efficiencyPercentage?.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
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
          tickFormatter={(value: any) => formatTimeFromMinutes(Number(value))}
          allowDecimals={false}
          domain={[0, 'dataMax']}
          tickCount={5}
          scale="linear"
          label={{ value: 'Tiempo (min:seg)', angle: -90, position: 'insideLeft' }}
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
          dataKey="standardTimeMinutes"
          fill="#3b82f6"
          name="Tiempo STD"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-standard-${index}`}
              className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
            />
          ))}
        </Bar>
        
        <Bar
          dataKey="realTimeMinutes"
          fill="#f97316"
          name="Ejecutado"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-real-${index}`}
              className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
            />
          ))}
        </Bar>
        
        <Legend />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TimeChart; 