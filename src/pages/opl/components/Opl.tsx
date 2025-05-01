import React from "react";
import Strings from "../../../utils/localizations/Strings";
import { Typography } from "antd";

const { Paragraph } = Typography;

const Opl = (): React.ReactElement => {
  return (
    <div className="opl-container">
      <Paragraph className="opl-description">
        {Strings.oplDescription}
      </Paragraph>
    </div>
  );
};

export default Opl;
