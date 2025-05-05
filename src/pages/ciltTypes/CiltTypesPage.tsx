import React from "react";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import CiltTypes from "./components/CiltTypes";

const CiltTypesPage = (): React.ReactElement => {
  return (
    <MainContainer 
      title={Strings.ciltTypesSB}
      content={<CiltTypes />}
    />
  );
};

export default CiltTypesPage;
