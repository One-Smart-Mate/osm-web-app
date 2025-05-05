import React from "react";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import CiltFrecuencies from "./components/CiltFrecuencies";

const CiltFrecuenciesPage = (): React.ReactElement => {
  return (
    <MainContainer 
      title={Strings.ciltFrecuenciesSB}
      content={<CiltFrecuencies />}
    />
  );
};

export default CiltFrecuenciesPage;
