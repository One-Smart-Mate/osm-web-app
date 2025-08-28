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
import { useGetCiltSequenceExecutionsBySiteMutation } from "../../../services/cilt/ciltSequencesExecutionsService";
import { useGetCiltMstrBySiteQuery } from "../../../services/cilt/ciltMstrService";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";
import DrawerCiltList from "./DrawerCiltList";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";

export interface ExecutionChartProps {
  filters: CiltChartFilters;
}

const ExecutionChart = ({ filters }: ExecutionChartProps) => {
  const [getExecutionData] = useGetCiltExecutionChartDataMutation();
  const [getExecutionsBySite] = useGetCiltSequenceExecutionsBySiteMutation();
  const [chartData, setChartData] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCilts, setSelectedCilts] = useState<CiltMstr[]>([]);
  const [isLoadingCilts, setIsLoadingCilts] = useState(false);
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  // Get site CILTs data
  const { data: siteCilts } = useGetCiltMstrBySiteQuery(
    filters.siteId?.toString() || '',
    { skip: !filters.siteId }
  );

  const handleGetData = async () => {
    try {
      const response = await getExecutionData(filters).unwrap();
      
      const transformedData = response.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        }),
        originalDate: item.date, // Keep original date for filtering
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

  // Handle bar click to open drawer with CILTs for that date
  const handleBarClick = async (data: any) => {
    if (!filters.siteId || !siteCilts) return;

    setIsLoadingCilts(true);
    setSelectedDate(data.date);
    setDrawerOpen(true);

    try {
      // Get executions for the site
      const executions = await getExecutionsBySite(filters.siteId.toString()).unwrap();
      
      // Filter executions by the selected date
      const executionsForDate = executions.filter(execution => {
        if (!execution.secuenceSchedule) return false;
        
        const executionDate = new Date(execution.secuenceSchedule).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        });
        return executionDate === data.date;
      });

      // Get unique CILT IDs from filtered executions
      const ciltIds = [...new Set(executionsForDate
        .map(execution => execution.ciltId)
        .filter(id => id !== null)
      )];

      // Filter site CILTs to get only those with executions on this date
      const relatedCilts = siteCilts.filter(cilt => 
        ciltIds.includes(cilt.id)
      );

      setSelectedCilts(relatedCilts);
    } catch (error) {
      console.error('Error fetching CILTs for date:', error);
      setSelectedCilts([]);
    } finally {
      setIsLoadingCilts(false);
    }
  };

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
          <p className="text-blue-500">{Strings.programmed}: {payload[0]?.value}</p>
          <p className="text-green-500">{Strings.executed}: {payload[1]?.value}</p>
          <p className="text-gray-500 text-xs mt-1">Click to see CILTs</p>
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
            name={Strings.programmed}
            onClick={(data) => handleBarClick(data)}
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
            name={Strings.executed}
            onClick={(data) => handleBarClick(data)}
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

      <DrawerCiltList
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cilts={selectedCilts}
        isLoading={isLoadingCilts}
        title={Strings.executionCiltChart}
        date={selectedDate}
        chartType="Executions"
      />
    </>
  );
};

export default ExecutionChart; 