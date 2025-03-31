import { useNavigate } from "react-router-dom";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import Routes from "../../../utils/Routes";

interface props {
  siteId: string;
  siteName: string;
}

const ViewPositionsButton = ({ siteId, siteName }: props) => {
  const navigate = useNavigate();

  const handleOnViewPositions = (siteId: string, siteName: string) => {
    navigate(Routes.AdminPrefix + Routes.Positions, {
      state: { siteId, siteName },
    });
  };

  return (
    <CustomButton
      type="action"
      onClick={() => handleOnViewPositions(siteId, siteName)}
    >
      {Strings.viewPositions}
    </CustomButton>
  );
};

export default ViewPositionsButton;
