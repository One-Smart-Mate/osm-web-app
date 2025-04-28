import { useNavigate } from "react-router-dom";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import { adminSites } from "../../routes/Routes";
import { isRedesign } from "../../../utils/Extensions";
import { Button } from "antd";
import Constants from "../../../utils/Constants";
import { navigateWithProps } from "../../../pagesRedesign/routes/RoutesExtensions";

interface props {
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyLogo: string
}

const ViewSitesButton = ({ companyId, companyName, companyAddress,companyPhone,companyLogo }: props) => {

  const navigate = useNavigate();
  const navigateprops = navigateWithProps();

  const handleOnViewPriorities = (companyId: string, companyName: string, companyAddress: string, companyPhone: string, companyLogo: string) => {
    if (isRedesign()) {
      navigateprops({
        path: Constants.ROUTES_PATH.sites,
        companyId,
        companyName,
        companyAddress,
        companyPhone,
        companyLogo,
      });
    } else {
      navigate(adminSites.fullPath.replace(Strings.companyParam, companyId), {
        state: { companyId, companyName, companyAddress, companyPhone, companyLogo },
      });
    }
  };

  return (
    isRedesign() ? <Button
    type="primary"
    onClick={() => handleOnViewPriorities(companyId, companyName, companyAddress,companyPhone, companyLogo)}
  >
    {Strings.viewSites}
  </Button> : <CustomButton
    type="action"
    onClick={() => handleOnViewPriorities(companyId, companyName, companyAddress,companyPhone, companyLogo)}
  >
    {Strings.viewSites}
  </CustomButton>
  );
};

export default ViewSitesButton;
