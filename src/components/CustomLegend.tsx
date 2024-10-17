import { LegendProps } from "recharts";
import { capitalizeFirstLetter } from "../utils/Extensions";

const CustomLegend = (props: LegendProps) => {
  const { payload = [] } = props;
  return (
    <div className="flex justify-center flex-wrap gap-2 mb-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex gap-1 items-center">
          <div
            className="w-5 h-4 md:h-5 rounded-lg border border-black"
            style={{
              background: entry.color,
            }}
          />
          <h1 className="md:text-sm text-xs">
            {capitalizeFirstLetter(entry.value)}
          </h1>
        </div>
      ))}
    </div>
  );
};
export default CustomLegend;
