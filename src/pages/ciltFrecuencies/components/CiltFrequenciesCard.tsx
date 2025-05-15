import React from "react";
import { Card, Typography} from "antd";
import { CiltFrequency } from "../../../data/cilt/ciltFrequencies/ciltFrequencies";
import Strings from "../../../utils/localizations/Strings";
import CiltFrequenciesForm, { CiltFrequenciesFormType } from "./CiltFrequenciesForm";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";


interface CiltFrequenciesCardProps {
  item: CiltFrequency;
  onComplete?: () => void;
}

const CiltFrequenciesCard = ({ item, onComplete }: CiltFrequenciesCardProps): React.ReactElement => {

  return (
    <Card
      hoverable
      title={<Typography.Title level={5}>{item.frecuencyCode}</Typography.Title>}
      actions={[
        <CiltFrequenciesForm
          formType={CiltFrequenciesFormType.UPDATE}
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
        title={Strings.description}
        label={item.description}
      />

      <AnatomySection
        title={Strings.status}
        label={
          item.status === "A" ? (
            <span style={{ color: "green" }}>{Strings.active}</span>
          ) : (
            <span style={{ color: "red" }}>{Strings.inactive}</span>
          )
        }
      />


    </Card>
  );
};

export default CiltFrequenciesCard;
