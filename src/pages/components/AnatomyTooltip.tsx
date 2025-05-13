import React from "react";
import { Tooltip } from "antd";
import { BsQuestionCircle } from "react-icons/bs";

interface AnatomyTooltipProps {
  title: string;
}

const AnatomyTooltip: React.FC<AnatomyTooltipProps> = ({ title }): React.ReactElement => {
  return (
    <Tooltip title={title} className="mt-3 mr-2">
      <BsQuestionCircle className="ml-2 text-blue-500 text-sm" />
    </Tooltip>
  );
};

export default AnatomyTooltip;