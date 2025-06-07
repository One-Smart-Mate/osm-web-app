import { useEffect, useState } from "react";
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
import Strings from "../../../utils/localizations/Strings";
import useDarkMode from "../../../utils/hooks/useDarkMode";

export interface WeeksChartProps {
  siteId: string;
  cardTypeName?: string | null;
}

const WeeksChart = ({ siteId, cardTypeName }: WeeksChartProps) => {
  const isDarkMode = useDarkMode();
  const [getWeeks] = useGetWeeksChartDataMutation();
  const [weeks, setWeeks] = useState<Weeks[]>([]);
  const handleGetData = async () => {
    try {
      const response = await getWeeks(siteId).unwrap();
      
      setWeeks(response);
      
      console.log('WeeksChart - Data loaded:', response);
    } catch (error) {
      console.error('Error fetching weeks chart data:', error);
    }
  };
  useEffect(() => {
    handleGetData();
  }, [siteId, cardTypeName]);

  const textClass = isDarkMode ? 'text-white' : '';

  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className={`flex mb-2 gap-2 justify-center ${textClass}`}>
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
    );
  };

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart
        width={730}
        height={250}
        data={weeks}
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
