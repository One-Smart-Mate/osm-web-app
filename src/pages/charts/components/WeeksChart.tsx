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
      // If no filters are applied, use the original weeks endpoint
      if (!hasCardTypeFilter && !startDate && !endDate) {
        console.log('WeeksChart - Using original weeks endpoint (no filters)');
        const response = await getWeeks(siteId).unwrap();
        setWeeks(response);
        console.log('WeeksChart - Original API response:', response);
        return;
      }

      // If filters are applied, get all cards and calculate weeks data in frontend
      console.log('WeeksChart - Getting all cards for frontend filtering');
      const cardsResponse = await getCards(siteId).unwrap();
      setAllCards(cardsResponse);
      console.log('WeeksChart - All cards loaded:', cardsResponse.length);
      
    } catch (error) {
      console.error('Error fetching weeks chart data:', error);
    }
  };

  // Calculate weeks data from filtered cards
  const filteredWeeksData = useMemo(() => {
    if (!hasCardTypeFilter && !startDate && !endDate) {
      return weeks; // Use original API data when no filters
    }

    if (!allCards.length) {
      return []; // No cards data yet
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
        cumulativeEradicated
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

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart
        width={730}
        height={250}
        data={filteredWeeksData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis 
          tickFormatter={(value: any) => Math.round(Number(value)).toString()}
          allowDecimals={false}
          domain={[0, 'dataMax']}
          tickCount={5}
          scale="linear"
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
                    {Strings.week} {props.label}
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
