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
import { useGetCiltSequenceExecutionsBySiteMutation } from "../../../services/cilt/ciltSequencesExecutionsService";
import { useGetCiltMstrBySiteQuery } from "../../../services/cilt/ciltMstrService";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";
import DrawerCiltList from "./DrawerCiltList";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";

export interface TimeChartProps {
  filters: CiltChartFilters;
}

const TimeChart = ({ filters }: TimeChartProps) => {
  const [getTimeData] = useGetCiltTimeChartDataMutation();
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
        originalDate: item.date, // Keep original date for filtering
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

  // Handle bar click to open drawer with CILTs for that date
  const handleBarClick = async (data: any, barType: string) => {
    if (!filters.siteId || !siteCilts) return;

    setIsLoadingCilts(true);
    setSelectedDate(data.date);
    setDrawerOpen(true);

    try {
      // Get executions for the site
      const executions = await getExecutionsBySite(filters.siteId.toString()).unwrap();
      
      // Filter executions by the selected date and that have been executed (for time chart)
      const executionsForDate = executions.filter(execution => {
        const executionDate = new Date(execution.secuenceSchedule).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        });
        return executionDate === data.date && execution.secuenceStart; // Only executed ones
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
          <p className="text-blue-500">{Strings.standardTime}: {data?.standardTimeDisplay}</p>
          <p className="text-orange-500">{Strings.executed}: {data?.realTimeDisplay}</p>
          <p className="text-gray-500">{Strings.executedCount}: {data?.executedCount}</p>
          <p className="text-green-500">{Strings.efficiency}: {data?.efficiencyPercentage?.toFixed(1)}%</p>
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
          tickFormatter={(value: any) => formatTimeFromMinutes(Number(value))}
          allowDecimals={false}
          domain={[0, 'dataMax']}
          tickCount={5}
          scale="linear"
          label={{ value: Strings.timeMinSeg, angle: -90, position: 'insideLeft' }}
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
          name={Strings.standardTime}
          onClick={(data) => handleBarClick(data, 'standardTimeMinutes')}
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
          name={Strings.executed}
          onClick={(data) => handleBarClick(data, 'realTimeMinutes')}
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

    <DrawerCiltList
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      cilts={selectedCilts}
      isLoading={isLoadingCilts}
      title={Strings.timeCiltChart}
      date={selectedDate}
      chartType="Time"
    />
  </>
);
};

export default TimeChart; 