import React from "react";
import { Button, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import Strings from "../../utils/localizations/Strings";

const isDevelopment = process.env.NODE_ENV === 'development';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  showText?: boolean;
  tooltip?: string;
  size?: "small" | "middle" | "large";
  /** If true, only shows in development mode. Default: true */
  devOnly?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  showText = false,
  tooltip,
  size = "middle",
  devOnly = true,
}) => {
  // If devOnly is true and we're not in development, don't render
  if (devOnly && !isDevelopment) {
    return null;
  }

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
