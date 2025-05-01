import React from "react";
import Strings from "../../../utils/localizations/Strings";
import { Typography } from "antd";

const { Paragraph } = Typography;

const CiltProcedures = (): React.ReactElement => {
  return (
    <div className="cilt-procedures-container">
      <Paragraph className="cilt-procedures-description">
        {Strings.ciltProceduresDescription}
      </Paragraph>
    </div>
  );
};

export default CiltProcedures;
