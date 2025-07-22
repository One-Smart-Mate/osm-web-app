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
import { useGetCiltComplianceChartDataMutation, CiltChartFilters } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";

export interface ComplianceChartProps {
  filters: CiltChartFilters;
}

const ComplianceChart = ({ filters }: ComplianceChartProps) => {
  const [getComplianceData] = useGetCiltComplianceChartDataMutation();
  const [chartData, setChartData] = useState<any[]>([]);
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  const handleGetData = async () => {
    try {
      const response = await getComplianceData(filters).unwrap();
      
      const transformedData = response.map((item: any) => ({
        userName: item.userName,
        assigned: item.assigned,
        executed: item.executed,
        compliancePercentage: item.compliancePercentage,
      }));

      // Sort by total assigned descending
      const sortedData = transformedData.sort((a: any, b: any) => b.assigned - a.assigned);
      setChartData(sortedData);
    } catch (error) {
      console.error('Error fetching compliance chart data:', error);
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
          <p className="text-blue-500">{Strings.assigned}: {data?.assigned}</p>
          <p className="text-red-500">{Strings.executed}: {data?.executed}</p>
          <p className="text-green-500">{Strings.compliance}: {data?.compliancePercentage?.toFixed(1)}%</p>
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
          dataKey="userName"
          angle={-45}
          textAnchor="end"
          className="md:text-sm text-xs"
          height={60}
          interval={0}
        />
        
        <Bar
          dataKey="assigned"
          fill="#3b82f6"
          name={Strings.assigned}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-assigned-${index}`}
              className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
            />
          ))}
        </Bar>
        
        <Bar
          dataKey="executed"
          fill="#ef4444"
          name={Strings.executed}
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

export default ComplianceChart; 