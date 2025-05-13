import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetCompanySitesMutation,
  useGetUserSitesMutation,
} from "../../services/siteService";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { List } from "antd";
import { Site } from "../../data/site/site";
import Constants from "../../utils/Constants";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetSiteUpdatedIndicator,
  selectSiteUpdatedIndicator,
} from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../components/PaginatedList";
import SiteForm, { SiteFormType } from "./components/SiteForm";
import SiteCard from "./components/SiteCard";

const SitesPage = () => {
  const [getSites] = useGetCompanySitesMutation();
  const [getUserSites] = useGetUserSitesMutation();
  const location = useLocation();
  const [data, setData] = useState<Site[]>([]);
  const [isLoading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSiteUpdated = useAppSelector(selectSiteUpdatedIndicator);
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { isIhAdmin } = useCurrentUser();
  const companyName = location?.state?.companyName || Strings.empty;
  const [searchQuery, setSearchQuery] = useState(Strings.empty);

  const handleGetSites = async (): Promise<void> => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }

    const companyInfo = {
      companyId: location.state.companyId,
      companyName: location.state.companyName,
      companyAddress: location.state.companyAddress,
      companyPhone: location.state.companyPhone,
      companyLogo: location.state.companyLogo,
    };
    console.log(`[COMPANY] ${JSON.stringify(companyInfo)}`);
    sessionStorage.setItem(
      Constants.SESSION_KEYS.companyInfo,
      JSON.stringify(companyInfo)
    );

    setLoading(true);
    const response = isIhAdmin()
      ? await getSites(location.state.companyId).unwrap()
      : await getUserSites(user.userId).unwrap();
    setData(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetSites();
  }, [isSiteUpdated]);

  useEffect(() => {
    if (isSiteUpdated) {
      dispatch(resetSiteUpdatedIndicator());
    }
  }, [isSiteUpdated, dispatch]);

  const search = useCallback((item: Site, query: string): boolean => {
    const normalizedQuery = query.toLowerCase();
    const { name, address, contact } = item;

    return (
      name.toLowerCase().includes(normalizedQuery) ||
      address.toLowerCase().includes(normalizedQuery) ||
      contact.toLowerCase().includes(normalizedQuery)
    );
  }, []);

  const filteredData = useMemo(() => {
    if (searchQuery.length > 0) {
      return data.filter((item) => search(item, searchQuery));
    }
    return data;
  }, [searchQuery, data]);

  const handleOnSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <MainContainer
        title={`${isIhAdmin() ? Strings.sitesOf : Strings.yourSitesOfCompany}`}
        description={companyName}
        isLoading={isLoading}
        enableSearch={isIhAdmin()}
        onSearchChange={handleOnSearch}
        enableBackButton={isIhAdmin()}
        enableCreateButton={isIhAdmin()}
        createButtonComponent={
          <SiteForm
            onComplete={() => handleGetSites()}
            companyName={companyName}
            formType={SiteFormType.CREATE}
          />
        }
        content={
          <div>
            <PaginatedList
              className="no-scrollbar"
              dataSource={filteredData}
              renderItem={(value: Site, index: number) => (
                <List.Item key={index}>
                  <SiteCard
                    site={value}
                    companyName={companyName}
                    onComplete={() => handleGetSites()}
                  />
                </List.Item>
              )}
              loading={isLoading}
            />
          </div>
        }
      />
    </>
  );
};

export default SitesPage;
