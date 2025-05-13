import React from "react";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import CiltFrecuencies from "./components/CiltFrecuencies";
import { useLocation  } from "react-router-dom";

const CiltFrecuenciesPage = (): React.ReactElement => {

    const location = useLocation();
     const siteName = location?.state?.siteName || Strings.empty;

  return (
    <MainContainer 
      title={Strings.ciltFrecuenciesOf}
      description={siteName}
      content={<CiltFrecuencies />}
    />
  );
};

export default CiltFrecuenciesPage;
