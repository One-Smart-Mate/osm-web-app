import { useEffect, useState, useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Weeks } from "../../../data/charts/charts";
import { useGetWeeksChartDataMutation } from "../../../services/chartService";
import { useGetCardsMutation } from "../../../services/cardService";
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";
import { getWeekNumber } from "../../../utils/timeUtils";
import dayjs from "dayjs";

export interface WeeksChartProps {
  siteId: string;
  startDate?: string;
  endDate?: string;
  cardTypeName?: string | null;
}

const WeeksChart = ({ siteId, startDate, endDate, cardTypeName }: WeeksChartProps) => {
  const isDarkMode = useDarkMode();
  const [getWeeks] = useGetWeeksChartDataMutation();
  const [getCards] = useGetCardsMutation();
  const [weeks, setWeeks] = useState<Weeks[]>([]);
  const [allCards, setAllCards] = useState<any[]>([]);

  // Show filter indicator when card type filter is applied
  const hasCardTypeFilter = cardTypeName && cardTypeName !== 'all';

  const handleGetData = async () => {
    try {
      // If no filters are applied, use the backend weeks data directly
      if (!hasCardTypeFilter && !startDate && !endDate) {
        console.log('WeeksChart - Using backend weeks data (no filters)');
        const response = await getWeeks(siteId).unwrap();
        
        console.log('WeeksChart - Backend response:', response);
        
        // Transform data to add weekLabel for display
        const transformedData = response.map((weekData: any) => ({
          ...weekData,
          weekLabel: `${weekData.year}-W${weekData.week.toString().padStart(2, '0')}`,
          sortKey: weekData.year * 100 + weekData.week
        }));
        
        setWeeks(transformedData);
        return;
      }

      // If filters are applied, get all cards and calculate in frontend
      console.log('WeeksChart - Getting all cards for frontend filtering');
      const cardsResponse = await getCards(siteId).unwrap();
      setAllCards(cardsResponse);
      console.log('WeeksChart - All cards loaded:', cardsResponse.length);
      
    } catch (error) {
      console.error('Error fetching weeks chart data:', error);
      setWeeks([]);
    }
  };

  // Calculate weeks data: use backend data when no filters, frontend calculation when filters applied
  const filteredWeeksData = useMemo(() => {
    // If no filters are applied, use backend data directly
    if (!hasCardTypeFilter && !startDate && !endDate) {
      return weeks;
    }

    // If filters are applied but we don't have cards data yet, return empty
    if (!allCards.length) {
      return [];
    }

    // Filter cards by card type
    let filteredCards = allCards;
    if (hasCardTypeFilter) {
      filteredCards = allCards.filter(card => 
        card.cardTypeName.toLowerCase() === cardTypeName?.toLowerCase()
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = dayjs(startDate).startOf('day');
      const end = dayjs(endDate).endOf('day');
      
      filteredCards = filteredCards.filter(card => {
        const creationDate = dayjs(card.cardCreationDate);
        return creationDate.isAfter(start) && creationDate.isBefore(end);
      });
    }

    // Group cards by year and week
    const weeklyData: { [key: string]: { issued: number; eradicated: number; year: number; week: number } } = {};
    
    filteredCards.forEach(card => {
      const creationDate = dayjs(card.cardCreationDate);
      const year = creationDate.year();
      const week = getWeekNumber(creationDate);
      const key = `${year}-${week}`;
      
      if (!weeklyData[key]) {
        weeklyData[key] = { issued: 0, eradicated: 0, year, week };
      }
      
      weeklyData[key].issued++;
      
      // Check if card is closed/eradicated
      if (card.status === 'C' || card.status === 'R' || card.status === 'C/R') {
        weeklyData[key].eradicated++;
      }
    });

    // Convert to array and calculate cumulative values
    const weeksArray = Object.values(weeklyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.week - b.week;
    });

    let cumulativeIssued = 0;
    let cumulativeEradicated = 0;

    const result = weeksArray.map(weekData => {
      cumulativeIssued += weekData.issued;
      cumulativeEradicated += weekData.eradicated;
      
      return {
        ...weekData,
        cumulativeIssued,
        cumulativeEradicated,
        weekLabel: `${weekData.year}-W${weekData.week.toString().padStart(2, '0')}`,
        sortKey: weekData.year * 100 + weekData.week
      };
    });

    console.log('WeeksChart - Frontend calculated data:', { 
      originalCards: allCards.length,
      filteredCards: filteredCards.length,
      weeksCalculated: result.length,
      filter: cardTypeName 
    });

    return result;
  }, [weeks, allCards, cardTypeName, hasCardTypeFilter, startDate, endDate]);

  useEffect(() => {
    handleGetData();
  }, [siteId, startDate, endDate, cardTypeName]);

  const textClass = isDarkMode ? 'text-white' : '';

  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className={`flex flex-col items-center mb-2 ${textClass}`}>
        {hasCardTypeFilter && (
          <div className="mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-md">
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {Strings.filterTag}: {cardTypeName}
            </span>
          </div>
        )}
        <div className="flex gap-2 justify-center">
          <div className="flex gap-1">
            <div
              className="w-5 rounded-lg"
              style={{ background: payload[0].color }}
            />
            <h1 className={`md:text-sm text-xs ${textClass}`}>{Strings.tagsIssued}</h1>
          </div>
          <div className="flex gap-1">
            <div
              className="w-5 rounded-lg"
              style={{ background: payload[1].color }}
            />
            <h1 className={`md:text-sm text-xs ${textClass}`}>{Strings.tagsEradicated}</h1>
          </div>
        </div>
      </div>
    );
  };

  // Custom tick formatter for X-axis to show only some labels to avoid crowding
  const formatXAxisTick = (tickItem: string, index: number) => {
    // Show every nth tick based on data length to avoid overcrowding
    const dataLength = filteredWeeksData.length;
    const interval = Math.max(1, Math.floor(dataLength / 8)); // Show max 8 labels
    
    if (index % interval === 0 || index === dataLength - 1) {
      return tickItem;
    }
    return '';
  };

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart
        width={730}
        height={250}
        data={filteredWeeksData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="weekLabel"
          angle={-45}
          textAnchor="end"
          height={60}
          interval={0}
          tickFormatter={formatXAxisTick}
        />
        <YAxis 
          tickFormatter={(value: any) => Math.round(Number(value)).toString()}
          allowDecimals={false}
          domain={[0, 'dataMax']}
          tickCount={5}
          scale="linear"
          label={{ value: Strings.cards, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          content={(props) => {
            if (props.active && props.payload && props.payload.length) {
              return (
                <div className={`bg-card-fields text-black py-2 px-4 rounded-md shadow-lg ${textClass}`}>
                  <p>
                    {Strings.year} {props.payload[0].payload.year}
                  </p>
                  <p>
                    {Strings.week} {props.payload[0].payload.week}
                  </p>
                  <p>
                    {Strings.cumulativeIssued}{" "}
                    {props.payload[0].payload.cumulativeIssued}
                  </p>
                  <p>
                    {Strings.cumulativeEradicated}{" "}
                    {props.payload[0].payload.cumulativeEradicated}
                  </p>
                  {hasCardTypeFilter && (
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {Strings.tagType} {cardTypeName}
                    </p>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend verticalAlign="top" content={renderLegend} />
        <Line type="monotone" dataKey="cumulativeIssued" stroke="#6b3a3d" strokeWidth={2} />
        <Line type="monotone" dataKey="cumulativeEradicated" stroke="#4f6b54" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};
export default WeeksChart;
