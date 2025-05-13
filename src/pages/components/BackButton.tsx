import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Strings from "../../utils/localizations/Strings";
import { useGoBack } from "../../utils/hooks/useGoBack";

const BackButton: React.FC = () => {
  const goBack = useGoBack();

  const handleBack = () => {
    goBack({}); // Navigates to the previous page
  };

  return (
    <Button
      type="default"
      icon={<ArrowLeftOutlined />}
      onClick={handleBack}
      style={{ display: "flex", alignItems: "center" }}
    >
      {Strings.goBack}
    </Button>
  );
};

export default BackButton;