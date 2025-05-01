import React from "react";
import Strings from "../../../utils/localizations/Strings";
import { Typography } from "antd";

const { Paragraph } = Typography;

const CiltFrecuencies = (): React.ReactElement => {
  return (
    <div className="cilt-frecuencies-container">
      <Paragraph className="cilt-frecuencies-description">
        {Strings.ciltFrecuenciesDescription}
      </Paragraph>
    </div>
  );
};

export default CiltFrecuencies;
