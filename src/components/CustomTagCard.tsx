import { Tag } from "antd";

interface CustomTagProps {
  color?: "success" | "error";
  [key: string]: any;
}

const CustomTag: React.FC<CustomTagProps> = ({ color, children, ...rest }) => {
  const customSuccesColor = "#239F05";
  const customErrorColor = "#FF0100";

  let textColor;
  
  switch (color) {
    case "success":
      textColor = customSuccesColor;
      break;
    case "error":
      textColor = customErrorColor;
      break;
    default:
      textColor = "#000"; 
  }

  return (
    <Tag
      className="rounded-lg text-sm font-bold"
      style={{
        color: textColor,  
        backgroundColor: "transparent", 
        border: "none",
        fontWeight: "bold", 
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default CustomTag;
