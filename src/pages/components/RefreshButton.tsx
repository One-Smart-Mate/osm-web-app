import React from "react";
import { Button, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import Strings from "../../utils/localizations/Strings";

// Check if dev tools are enabled via environment variable
// This allows the button to show in deployed "develop" environments, not just localhost
const isDevToolsEnabled = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';

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
  // If devOnly is true and dev tools are not enabled, don't render
  if (devOnly && !isDevToolsEnabled) {
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
