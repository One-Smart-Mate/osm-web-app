import { Badge, Card, Typography } from "antd";
import { getStatusAndText } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import { OplTypes } from "../../../data/oplTypes/oplTypes";
import OplTypeForm, { OplTypeFormType } from "./OplTypeForm";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";
import { BsFileText, BsCalendarCheck } from "react-icons/bs";

interface CardProps {
  oplType: OplTypes;
  onComplete?: () => void;
}

const OplTypeCard = ({ oplType, onComplete }: CardProps) => {
  return (
    <Card
      hoverable
      title={
        <Typography.Title level={5}>
          {oplType.documentType}
        </Typography.Title>
      }
      className="rounded-xl shadow-md"
      actions={[
        <OplTypeForm
          data={oplType}
          formType={OplTypeFormType.UPDATE}
          onComplete={() => {
            if (onComplete) {
              onComplete();
            }
          }}
        />,
      ]}
    >
      <AnatomySection
        title={Strings.documentType}
        label={oplType.documentType}
        icon={<BsFileText />}
      />
      <AnatomySection
        title={Strings.status}
        label={
          <Badge
            status={getStatusAndText(oplType.status || 'A').status}
            text={getStatusAndText(oplType.status || 'A').text}
          />
        }
      />
      {oplType.createdAt && (
        <AnatomySection
          title={Strings.creation}
          label={new Date(oplType.createdAt).toLocaleDateString()}
          icon={<BsCalendarCheck />}
        />
      )}
    </Card>
  );
};

export default OplTypeCard; 