import { Tag } from "antd";
import { CardInterface } from "../../data/card/card";
import AnatomySection from "./AnatomySection";
import { getCardStatusAndText } from "../../utils/Extensions";
import Strings from "../../utils/localizations/Strings";

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

  const isCardClosed = cardStatus.text == Strings.closed;

  return (
    <AnatomySection
      title={Strings.status}
      label={
        <Tag className='p-2' color={isCardClosed ? "red" : "green"}>
          {cardStatus.text}
        </Tag>
      }
      justify={justify}
    />
  );
};

export default TagStatus;
