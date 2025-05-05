import React from "react";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import Opl from "./components/Opl";

const OplPage = (): React.ReactElement => {
  return (
    <MainContainer 
      title=""
      content={<Opl />}
    />
  );
};

export default OplPage;
