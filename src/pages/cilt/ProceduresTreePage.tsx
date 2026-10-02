import React from "react";
import { useLocation } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import MainContainer from "../layouts/MainContainer";
import ProceduresTree from "./components/ProceduresTree";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { useAppSelector } from "../../core/store";
import { selectSiteId } from "../../core/genericReducer";

const ProceduresTreePage = (): React.ReactElement => {
  const location = useLocation();
  const { user } = useCurrentUser();
  const siteIdFromSelector = useAppSelector(selectSiteId);
  // Resolve siteId from navigation state, site selector, or the user's first site
  const siteId = location.state?.siteId || siteIdFromSelector || user?.sites?.[0]?.id || "";
  const siteName = location.state?.siteName || "";

  return (
    <MainContainer
      title={Strings.proceduresTreeSB}
      description={siteName || Strings.empty}
      content={
        <div style={{ height: 'calc(100vh - 150px)', width: '100%' }}>
          <ProceduresTree siteId={siteId ? String(siteId) : ""} siteName={siteName} />
        </div>
      }
      enableSearch={false}
      enableCreateButton={false}
      isLoading={false}
    />
  );
};

export default ProceduresTreePage;