import React from "react";
import { Card, Typography} from "antd";
import Strings from "../../../utils/localizations/Strings";
import { CiltType } from "../../../data/cilt/ciltTypes/ciltTypes";
import CiltTypesForm, { CiltTypesFormType } from "./CiltTypesForm";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";


interface CiltTypesCardProps {
  item: CiltType;
  onComplete?: () => void;
}

const CiltTypesCard = ({ item, onComplete }: CiltTypesCardProps): React.ReactElement => {



  return (
    <Card
      hoverable
      title={<Typography.Title level={5}>{item.name}</Typography.Title>}
      actions={[
        <CiltTypesForm
          formType={CiltTypesFormType.UPDATE}
          data={item}
          onComplete={() => {
            if (onComplete) {
              onComplete();
            }
          }}
        />,
      ]}
    >

<AnatomySection
        title={Strings.status}
        label={
          item.status === Strings.activeValue ? (
            <span style={{ color: "green" }}>{Strings.active}</span>
          ) : (
            <span style={{ color: "red" }}>{Strings.inactive}</span>
          )
        }
      />

{item.color && (
  <AnatomySection
    title={Strings.color}
    label={
      <span>
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: `#${item.color}`,
            border: '1px solid #ccc',
            borderRadius: '4px',
            verticalAlign: 'middle',
            marginRight: '8px',
          }}
        />
        #{item.color}
      </span>
    }
  />
)}




    </Card>
  );
};

export default CiltTypesCard;
