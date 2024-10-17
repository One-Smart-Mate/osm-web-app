import { Button, ConfigProvider, theme } from "antd";

interface CustomButtonProps {
  type?: "primary" | "success" | "warning" | "cancel" | "edit" | "action";
  [key: string]: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({ type, ...rest }) => {
  const { token } = theme.useToken();

  let btn = <Button type="primary" {...rest} />;

  let colorPrimary = null;

  const customColorSuccess = "#337357";
  const colorEdit = "#10439F";
  const colorAction = "#8c2044";

  switch (type) {
    case "success":
      colorPrimary = customColorSuccess;
      break;
    case "warning":
      colorPrimary = token.colorWarning;
      break;
    case "cancel":
      colorPrimary = token.colorError;
      break;
    case "edit":
      colorPrimary = colorEdit;
      break;
    case "action":
      colorPrimary = colorAction;
      break;
  }

  if (colorPrimary) {
    btn = (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary,
          },
        }}
      >
        {btn}
      </ConfigProvider>
    );
  }

  return btn;
};

export default CustomButton;
