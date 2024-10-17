import { Methodology } from "../../../data/charts/charts";
import {
  Cell,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CardTypesCatalog } from "../../../data/cardtypes/cardTypes";
import Strings from "../../../utils/localizations/Strings";

export interface ChartProps {
  methodologies: Methodology[];
  methodologiesCatalog: CardTypesCatalog[];
}

const MethodologiesChart = ({ methodologies }: ChartProps) => {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: PieLabelRenderProps | any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const text = `${(percent * 100).toFixed(1)}%`;
    const textWidth = text.length * 9;
    const textHeight = 18;

    return (
      <g>
        <rect
          x={x - textWidth / 2}
          y={y - textHeight / 2}
          width={textWidth}
          height={textHeight}
          fill="rgba(0, 0, 0, 0.75)"
          rx={5}
          ry={5}
        />
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <PieChart>
        <Pie
          stroke="black"
          dataKey="totalCards"
          data={methodologies}
          cx="50%"
          cy="45%"
          outerRadius={100}
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {methodologies.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`#${entry.color}`} />
          ))}
        </Pie>
        <Tooltip
          content={({ payload }) => (
            <div>
              {payload?.map((item, index) => (
                <div
                  className="bg-card-fields md:text-sm text-xs w-52 md:w-auto text-white py-2 px-4 rounded-md shadow-lg"
                  key={index}
                >
                  <p>
                    {Strings.cardName} {item.payload.methodology}
                  </p>
                  <p>
                    {Strings.totalCards} {item.payload.totalCards}
                  </p>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MethodologiesChart;
