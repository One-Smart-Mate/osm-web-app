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

export interface ChartProps {
  siteId: string;
}

const WeeksChart = ({ siteId }: ChartProps) => {
  const [getWeeks] = useGetWeeksChartDataMutation();
  const [weeks, setWeeks] = useState<Weeks[]>([]);
  const handleGetData = async () => {
    const response = await getWeeks(siteId).unwrap();
    setWeeks(response);
  };
  useEffect(() => {
    handleGetData();
  }, []);

  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex mb-2 gap-2 justify-center">
        <div className="flex gap-1">
          <div
            className="w-5 rounded-lg"
            style={{ background: payload[0].color }}
          />
          <h1 className="md:text-sm text-xs">{Strings.tagsIssued}</h1>
        </div>
        <div className="flex gap-1">
          <div
            className="w-5 rounded-lg"
            style={{ background: payload[1].color }}
          />
          <h1 className="md:text-sm text-xs">{Strings.tagsEradicated}</h1>
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
        <YAxis tickFormatter={(value: any) => Math.round(Number(value)).toString()} />
        <Tooltip
          content={(props) => {
            if (props.active && props.payload && props.payload.length) {
              return (
                <div className="bg-card-fields text-white py-2 px-4 rounded-md shadow-lg">
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
