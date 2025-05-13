import { useNavigate } from "react-router-dom";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import Routes from "../../../utils/Routes";

interface props {
  siteId: string;
  siteName: string;
}

const ViewChartsButton = ({ siteId, siteName }: props) => {
  const navigate = useNavigate();

  const handleOnViewCharts = (siteId: string, siteName: string) => {
    navigate(Routes.AdminPrefix + Routes.Charts, { state: { siteId, siteName } });
  };

  return (
    <CustomButton
      type="action"
      onClick={() => handleOnViewCharts(siteId, siteName)}
    >
      {Strings.viewCharts}
    </CustomButton>
  );
};

export default ViewChartsButton;
