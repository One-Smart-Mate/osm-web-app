import React from "react";
import { useLocation } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import ProceduresTree from "./components/ProceduresTree";

const ProceduresTreePage = (): React.ReactElement => {
  const location = useLocation();
  const siteId = location.state?.siteId || "";
  const siteName = location.state?.siteName || "";

  return (
    <MainContainer
      title={Strings.proceduresTreeSB}
      description={siteName || Strings.empty}
      content={
        <div style={{ height: 'calc(100vh - 150px)', width: '100%' }}>
          <ProceduresTree siteId={siteId} siteName={siteName} />
        </div>
      }
      enableSearch={false}
      enableCreateButton={false}
      isLoading={false}
    />
  );
};

export default ProceduresTreePage;