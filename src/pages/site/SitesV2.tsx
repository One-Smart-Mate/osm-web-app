import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetCompanySitesMutation,
  useGetUserSitesMutation,
} from "../../services/siteService";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Card, List, Modal, Space, Typography } from "antd";
import { Site } from "../../data/site/site";
import Constants from "../../utils/Constants";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetSiteUpdatedIndicator,
  selectSiteUpdatedIndicator,
} from "../../core/genericReducer";
import { getStatusAndText } from "../../utils/Extensions";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import { UnauthorizedRoute } from "../../utils/Routes";
import {
  BsBuildingAdd,
  BsDiagram3,
  BsFiles,
  BsMailbox,
  BsPerson,
  BsPinMap,
  BsTelephone,
  BsTelephoneOutbound,
} from "react-icons/bs";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import { navigateWithProps } from "../../pagesRedesign/routes/RoutesExtensions";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../../components/PaginatedList";
import SiteForm, { SiteFormType } from "./components/SiteForm";

const SitesV2 = () => {
  const [getSites] = useGetCompanySitesMutation();
  const [getUserSites] = useGetUserSitesMutation();
  const location = useLocation();
  const [data, setData] = useState<Site[]>([]);
  const [isLoading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSiteUpdated = useAppSelector(selectSiteUpdatedIndicator);
  const [getSessionUser] = useSessionStorage<User>(Constants.SESSION_KEYS.user);
  const navigate = useNavigate();
  const [modalActions, setModalActions] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const { isIhAdmin } = useCurrentUser();
  const companyName = location?.state?.companyName || Strings.empty;
  const navigateProps = navigateWithProps();
  const [searchQuery, setSearchQuery] = useState("");

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

    const user = getSessionUser() as User;
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
              dataSource={filteredData}
              renderItem={(value: Site, index: number) => (
                <List.Item key={index}>
                  <Card
                    hoverable
                    className="rounded-xl shadow-md"
                    title={
                      <Typography.Title level={5}>
                        {value.name}
                      </Typography.Title>
                    }
                    cover={
                      <img
                        alt={value.name}
                        style={{ width: "auto", height: 200 }}
                        src={value.logo}
                      />
                    }
                    actions={[
                      <SiteForm
                        data={value}
                        onComplete={() => handleGetSites()}
                        companyName={companyName}
                        formType={SiteFormType.UPDATE}
                      />,
                      isIhAdmin() && (
                        <Button
                          type="primary"
                          onClick={() => {
                            setSelectedSite(value);
                            setModalActions(true);
                          }}
                        >
                          {Strings.actions}
                        </Button>
                      ),
                    ]}
                  >
                    <AnatomySection
                      title={Strings.name}
                      label={value.name}
                      icon={<BsBuildingAdd />}
                    />
                    <AnatomySection
                      title={Strings.rfc}
                      label={value.rfc}
                      icon={<BsFiles />}
                    />
                    <AnatomySection
                      title={Strings.companyAddress}
                      label={value.address}
                      icon={<BsPinMap />}
                    />
                    <AnatomySection
                      title={Strings.contact}
                      label={value.contact}
                      icon={<BsPerson />}
                    />
                    <AnatomySection
                      title={Strings.position}
                      label={value.position}
                      icon={<BsDiagram3 />}
                    />
                    <AnatomySection
                      title={Strings.phone}
                      label={value.phone}
                      icon={<BsTelephone />}
                    />
                    <AnatomySection
                      title={Strings.extension}
                      label={value.extension}
                      icon={<BsTelephoneOutbound />}
                    />
                    <AnatomySection
                      title={Strings.email}
                      label={value.email}
                      icon={<BsMailbox />}
                    />
                    <AnatomySection
                      title={Strings.cellular}
                      label={value.cellular}
                      icon={<BsTelephone />}
                    />
                    <AnatomySection
                      title={Strings.status}
                      label={
                        <Badge
                          status={getStatusAndText(value.status).status}
                          text={getStatusAndText(value.status).text}
                        />
                      }
                    />
                  </Card>
                </List.Item>
              )}
              loading={isLoading}
            />

            <Modal
              title={Strings.actions}
              open={modalActions}
              onOk={() => setModalActions(false)}
              onCancel={() => setModalActions(false)}
            >
              <Space wrap>
                <Button
                  type="default"
                  onClick={() => {
                    navigateProps({
                      path: Constants.ROUTES_PATH.charts,
                      siteId: selectedSite?.id,
                      siteName: selectedSite?.name,
                    });
                  }}
                >
                  {Strings.viewCharts}
                </Button>

                <Button
                  onClick={() => {
                    navigateProps({
                      path: Constants.ROUTES_PATH.cards,
                      siteId: selectedSite?.id,
                      siteName: selectedSite?.name,
                    });
                  }}
                >
                  {Strings.viewCards}
                </Button>

                <Button
                  onClick={() => {
                    navigateProps({
                      path: Constants.ROUTES_PATH.users,
                      siteId: selectedSite?.id,
                      siteName: selectedSite?.name,
                    });
                  }}
                >
                  {Strings.viewUsers}
                </Button>

                <Button
                  onClick={() => {
                    navigateProps({
                      path: Constants.ROUTES_PATH.priorities,
                      siteId: selectedSite?.id,
                      siteName: selectedSite?.name,
                    });
                  }}
                >
                  {Strings.viewPriorities}
                </Button>

                <Button
                  onClick={() => {
                    navigateProps({
                      path: Constants.ROUTES_PATH.cardTypes,
                      siteId: selectedSite?.id,
                      siteName: selectedSite?.name,
                    });
                  }}
                >
                  {Strings.viewCardTypes}
                </Button>

                <Button
                  onClick={() => {
                    navigateProps({
                      path: Constants.ROUTES_PATH.levels,
                      siteId: selectedSite?.id,
                      siteName: selectedSite?.name,
                    });
                  }}
                >
                  {Strings.viewLevels}
                </Button>

                <Button
                  onClick={() => {
                    navigateProps({
                      path: Constants.ROUTES_PATH.positions,
                      siteId: selectedSite?.id,
                      siteName: selectedSite?.name,
                    });
                  }}
                >
                  {Strings.viewPositions}
                </Button>
              </Space>
            </Modal>
          </div>
        }
      />
    </>
  );
};

export default SitesV2;
