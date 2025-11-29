import React from "react";
import { Button, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import Strings from "../../utils/localizations/Strings";

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  showText?: boolean;
  tooltip?: string;
  size?: "small" | "middle" | "large";
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  showText = false,
  tooltip,
  size = "middle",
}) => {
  const button = (
    <Button
      onClick={onRefresh}
      icon={<ReloadOutlined spin={isLoading} />}
      loading={isLoading}
      size={size}
    >
      {showText && Strings.refresh}
    </Button>
  );

  if (tooltip || !showText) {
    return (
      <Tooltip title={tooltip ?? Strings.refresh}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default RefreshButton;
