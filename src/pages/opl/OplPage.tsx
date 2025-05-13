import React from "react";
import MainContainer from "../layouts/MainContainer";
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
