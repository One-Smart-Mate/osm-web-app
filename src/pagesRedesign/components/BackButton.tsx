import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigates to the previous page
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