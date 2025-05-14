import React from "react";
import { useLocation } from "react-router-dom";
import MainContainer from "../layouts/MainContainer";
import Opl from "./components/Opl";
import Strings from "../../utils/localizations/Strings";

const OplPage = (): React.ReactElement => {
  const location = useLocation();
  const siteName = location.state?.siteName || "";

  return (
    <MainContainer 
      title={Strings.oplSB}
      description={siteName}
      content={<Opl />}
    />
  );
};

export default OplPage;
