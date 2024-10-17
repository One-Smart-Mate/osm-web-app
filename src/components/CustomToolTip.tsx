import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { capitalizeFirstLetter } from "../utils/Extensions";

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-fields md:text-sm text-xs w-52 md:w-auto text-white py-2 px-4 rounded-md shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((data, index) => (
          <p key={index} className="mt-1">{`${capitalizeFirstLetter(
            String(data.name)
          )}: ${data.value}`}</p>
        ))}
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
