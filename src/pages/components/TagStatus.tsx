import { Tag } from "antd";
import { CardInterface } from "../../data/card/card";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import { getCardStatusAndText } from "../../utils/Extensions";
import Strings from "../../utils/localizations/Strings";
import Constants from "../../utils/Constants";

interface TagStatusProps {
  card: CardInterface;
  justify: boolean;
}

const TagStatus = ({ card, justify }: TagStatusProps): React.ReactElement => {
  const cardStatus = getCardStatusAndText(
    card.status,
    card.cardDueDate,
    card.cardDefinitiveSolutionDate,
    card.cardCreationDate
  );

  // Color logic based on status:
  // - Orange for discarded (D)
  // - Yellow/Gold for provisional solution (P)
  // - Red for closed/resolved/canceled (R, C)
  // - Green for open/active states (A, V, etc)
  const getStatusColor = () => {
    switch (card.status) {
      case Constants.STATUS_DRAFT:     // "D" - Draft/Discarded
        return "orange";
      case "P":                        // "P" - Provisional solution
        return "gold";
      case Constants.STATUS_RESOLVED:  // "R" - Resolved
      case Constants.STATUS_CANCELED:  // "C" - Canceled
        return "red";
      case Constants.STATUS_ACTIVE:    // "A" - Active
      case "V":                        // "V" - Verified or other active states
      default:
        return "green";
    }
  };

  return (
    <AnatomySection
      title={Strings.status}
      label={
        <Tag className='p-2' color={getStatusColor()}>
          {cardStatus.text}
        </Tag>
      }
      justify={justify}
    />
  );
};

export default TagStatus;
