import { Tag } from "antd";

interface CustomTag {
  color?: "success" | "error";
  [key: string]: any;
}

const CustomTag: React.FC<CustomTag> = ({ color, ...rest }) => {
  const customSuccesColor = "#337357";
  const customErrorColor = "#8C1C13";

  let tagColor;
  switch (color) {
    case "success":
      tagColor = customSuccesColor;
      break;
    case "error":
      tagColor = customErrorColor;
      break;
  }

  return <Tag className="rounded-lg text-sm" color={tagColor} {...rest} />;
};

export default CustomTag;
