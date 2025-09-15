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

  const isCardDiscarded = card.status === Constants.STATUS_DRAFT; // Status 'D' means discarded/cancelled
  const isCardClosed = card.status === Constants.STATUS_RESOLVED || card.status === Constants.STATUS_CANCELED; // Resolved or Closed

  // Color logic: Orange for discarded (D), Red for closed/resolved (R,C), Green for open (A,P,V,etc)
  const getStatusColor = () => {
    if (isCardDiscarded) return "orange"; // Discarded/Cancelled
    if (isCardClosed) return "red";       // Resolved/Closed
    return "green";                       // Open states
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
