import React from "react";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import CiltProcedures from "./components/CiltProcedures";

const CiltProceduresPage = (): React.ReactElement => {
  return (
    <MainContainer 
      title={Strings.ciltProceduresSB}
      content={<CiltProcedures />}
    />
  );
};

export default CiltProceduresPage;
