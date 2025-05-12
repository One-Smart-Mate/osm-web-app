import Strings from "../../../utils/localizations/Strings";
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

  const navigateprops = navigateWithProps();

  const handleOnViewPriorities = (companyId: string, companyName: string, companyAddress: string, companyPhone: string, companyLogo: string) => {
    navigateprops({
      path: Constants.ROUTES_PATH.sites,
      companyId,
      companyName,
      companyAddress,
      companyPhone,
      companyLogo,
    });
  };

  return (
    <Button
      type="primary"
      onClick={() =>
        handleOnViewPriorities(
          companyId,
          companyName,
          companyAddress,
          companyPhone,
          companyLogo
        )
      }
    >
      {Strings.viewSites}
    </Button>
  );
};

export default ViewSitesButton;
