import React from "react";
import Strings from "../../../utils/localizations/Strings";
import { Typography } from "antd";

const { Paragraph } = Typography;

const CiltTypes = (): React.ReactElement => {
  return (
    <div className="cilt-types-container">
      <Paragraph className="cilt-types-description">
        {Strings.ciltTypesDescription}
      </Paragraph>
    </div>
  );
};

export default CiltTypes;
