import { Badge, Card, Typography } from "antd";
import { getStatusAndText } from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import { Priority } from "../../../data/priority/priority";
import PriorityForm, { PriorityFormType } from "./PriorityForm";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";
import { BsCalendarCheck, BsClock, BsListNested } from "react-icons/bs";

interface CardProps {
  priority: Priority;
  onComplete?: () => void;
}

const PriorityCard = ({ priority, onComplete }: CardProps) => {
  return (
    <Card
      hoverable
      title={
        <Typography.Title level={5}>
          {priority.priorityDescription}
        </Typography.Title>
      }
      className="rounded-xl shadow-md"
      actions={[
        <PriorityForm
          data={priority}
          formType={PriorityFormType._UPDATE}
          onComplete={() => {
            if (onComplete) {
              onComplete();
            }
          }}
        />,
      ]}
    >
      <AnatomySection
        title={Strings.priority}
        label={priority.priorityCode}
        icon={<BsCalendarCheck />}
      />
      <AnatomySection
        title={Strings.description}
        label={priority.priorityDescription}
        icon={<BsListNested />}
      />
      <AnatomySection
        title={Strings.daysNumber}
        label={priority.priorityDays}
        icon={<BsClock />}
      />
      <AnatomySection
        title={Strings.status}
        label={
          <Badge
            status={getStatusAndText(priority.status).status}
            text={getStatusAndText(priority.status).text}
          />
        }
      />
    </Card>
  );
};

export default PriorityCard;
