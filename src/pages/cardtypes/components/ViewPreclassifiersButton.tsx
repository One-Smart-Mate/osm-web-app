import { useNavigate } from "react-router-dom";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";

interface props {
  cardTypeId: string;
  cardTypeName: string;
  preclassifiersRoute: string;
}

const ViewPreclassifiersButton = ({
  cardTypeId,
  cardTypeName,
  preclassifiersRoute,
}: props) => {
  const navigate = useNavigate();

  const handleOnViewPriorities = (cardTypeId: string) => {
    navigate(preclassifiersRoute, {
      state: { cardTypeId, cardTypeName },
    });
  };

  return (
    <CustomButton
      type="action"
      onClick={() => handleOnViewPriorities(cardTypeId)}
    >
      {Strings.viewPreclassifiers}
    </CustomButton>
  );
};

export default ViewPreclassifiersButton;
