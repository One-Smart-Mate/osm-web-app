import { Button, Card, Tag } from "antd";
import { Position } from "../../../data/postiions/positions";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";

interface PositionCardProps {
  position: Position;
  onViewDetails: (_position: Position) => void;
  onEdit: (_position: Position) => void;
  onViewUsers: (_position: Position, _buttonElement: HTMLElement) => void;
  isUsersModalOpen: boolean;
}

const PositionCard = ({
  position,
  onViewDetails,
  onEdit,
  onViewUsers,
  isUsersModalOpen
}: PositionCardProps) => {
  const renderStatusTag = (status: string) => {
    if (status === Constants.STATUS_ACTIVE) {
      return <Tag color="green">{Strings.active}</Tag>;
    } else if (status === Constants.STATUS_SUSPENDED) {
      return <Tag color="orange">{Strings.suspended}</Tag>;
    } else if (status === Constants.STATUS_CANCELED) {
      return <Tag color="red">{Strings.canceled}</Tag>;
    } else {
      return <Tag color="default">{status}</Tag>;
    }
  };

  return (
    <div data-position-id={position.id}>
      <Card
        hoverable
        className="w-full shadow-md transition-all duration-200 hover:shadow-lg"
      >
      <Card.Meta
        title={
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-800">{position.name}</div>
          </div>
        }
        description={
          <div className="text-gray-600 mb-4">{position.description}</div>
        }
      />

      <div className="space-y-3">
        <AnatomySection
          title={Strings.area}
          label={position.areaName || Strings.noArea}
        />
        <AnatomySection
          title={Strings.status}
          label={renderStatusTag(position.status)}
        />

        {/* View Details Button */}
        <div className="pt-2">
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(position);
            }}
            className="w-full"
            size="large"
          >
            {Strings.viewDetails}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            type="default"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(position);
            }}
            className="flex-1"
          >
            {Strings.edit}
          </Button>
          <Button
            type="default"
            onClick={(e) => {
              e.stopPropagation();
              onViewUsers(position, e.currentTarget as HTMLElement);
            }}
            className={`flex-1 users-button ${isUsersModalOpen ? 'border-blue-500 text-blue-500 bg-blue-50' : ''}`}
          >
            {Strings.users}
          </Button>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default PositionCard;