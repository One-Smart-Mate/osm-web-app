import React from "react";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import Opl from "./components/Opl";

const OplPage = (): React.ReactElement => {
  return (
    <MainContainer 
      title={Strings.oplSB}
      content={<Opl />}
    />
  );
};

export default OplPage;
