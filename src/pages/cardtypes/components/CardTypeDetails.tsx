import React, { useEffect } from "react";
import { Descriptions } from "antd";
import Strings from "../../../utils/localizations/Strings";

interface CardTypeDetailsProps {
  nodeData: any;
}

const CardTypeDetails: React.FC<CardTypeDetailsProps> = ({ nodeData }) => {
  useEffect(() => {
  }, [nodeData]);

  const renderStatus = (status: string) => {
    switch (status) {
      case Strings.activeStatus:
        return Strings.active;
      case Strings.detailsOptionS:
        return Strings.detailsStatusSuspended;
      case Strings.C:
        return Strings.tagStatusCanceled;
      default:
        return Strings.empty;
    }
  };

  if (!nodeData) {
    return <div className="text-center">{Strings.noData}</div>;
  }

  return (
    <div className="p-4 shadow-md rounded-md border border-gray-300">
      <Descriptions bordered column={1}>
        <Descriptions.Item label={Strings.cardTypeDetailsMethodology}>
          {nodeData.methodology && nodeData.cardTypeMethodology
            ? `${nodeData.methodology} - ${nodeData.cardTypeMethodology}`
            : nodeData.methodology || nodeData.cardTypeMethodology || Strings.notSpecified}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.cardTypeDetailsName}>
          {nodeData.name || ""}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.cardTypeDetailsDescription}>
          {nodeData.description || ""}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.cardTypeDetailsColor}>
          <div
            className="w-16 h-6 rounded-md"
            style={{
              backgroundColor: `#${nodeData.color}`,
              border: "1px solid #ccc",
            }}
          />
        </Descriptions.Item>
        <Descriptions.Item label={Strings.cardTypeDetailsResponsible}>
          {nodeData.responsableName || `ID: ${nodeData.responsableId}` || ""}
        </Descriptions.Item>
        <Descriptions.Item label={Strings.cardTypeDetailsStatus}>
          {renderStatus(nodeData.status)}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default CardTypeDetails;
