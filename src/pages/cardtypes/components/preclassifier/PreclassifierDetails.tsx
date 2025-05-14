import React from "react";
import { Descriptions } from "antd";
import Strings from "../../../../utils/localizations/Strings";

interface PreclassifierDetailsProps {
  nodeData: any;
}

const PreclassifierDetails: React.FC<PreclassifierDetailsProps> = ({
  nodeData,
}) => {
  if (!nodeData) {
    return <div className="text-center">{Strings.noData}</div>;
  }

  return (
    <div className="p-4 shadow-md rounded-md border border-gray-300">
      <Descriptions bordered column={1}>
        <Descriptions.Item label={Strings.preclassifierDetailsCode}>
          {nodeData.preclassifierCode || Strings.empty}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.preclassifierDetailsDescription}>
          {nodeData.preclassifierDescription || Strings.empty}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.preclassifierDetailsStatus}>
          {nodeData.status || ""}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default PreclassifierDetails;
