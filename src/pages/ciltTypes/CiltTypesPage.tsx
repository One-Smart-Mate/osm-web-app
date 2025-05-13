import React from "react";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import CiltTypes from "./components/CiltTypes";
import { useLocation  } from "react-router-dom";


const CiltTypesPage = (): React.ReactElement => {

  const location = useLocation();
   const siteName = location?.state?.siteName || Strings.empty;

  return (
    <MainContainer 
      title={Strings.ciltTypesOf}
      description={siteName}
      content={<CiltTypes />}
    />
  );
};

export default CiltTypesPage;
