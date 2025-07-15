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
import { useGetCiltExecutionChartDataMutation, CiltChartFilters } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";

export interface ExecutionChartProps {
  filters: CiltChartFilters;
}

const ExecutionChart = ({ filters }: ExecutionChartProps) => {
  const [getExecutionData] = useGetCiltExecutionChartDataMutation();
  const [chartData, setChartData] = useState<any[]>([]);
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  const handleGetData = async () => {
    try {
      const response = await getExecutionData(filters).unwrap();
      
      const transformedData = response.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        }),
        programmed: item.programmed,
        executed: item.executed,
      }));

      setChartData(transformedData);
    } catch (error) {
      console.error('Error fetching execution chart data:', error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [filters]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
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
          <p className="text-blue-500">Programado: {payload[0]?.value}</p>
          <p className="text-green-500">Ejecutado: {payload[1]?.value}</p>
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
          tickFormatter={(value: any) => Math.round(Number(value)).toString()}
          allowDecimals={false}
          domain={[0, 'dataMax']}
          tickCount={5}
          scale="linear"
          label={{ value: 'CILT', angle: -90, position: 'insideLeft' }}
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
          dataKey="programmed"
          fill="#3b82f6"
          name="Programado"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-programmed-${index}`}
              className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
            />
          ))}
        </Bar>
        
        <Bar
          dataKey="executed"
          fill="#10b981"
          name="Ejecutado"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-executed-${index}`}
              className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
            />
          ))}
        </Bar>
        
        <Legend />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExecutionChart; 