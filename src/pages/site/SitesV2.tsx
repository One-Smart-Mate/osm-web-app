import { useEffect, useState } from "react";
import {
  useCreateSiteMutation,
  useGetCompanySitesMutation,
  useGetUserSitesMutation,
} from "../../services/siteService";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Form,
  List,
  Modal,
  Space,
  Typography,
} from "antd";
import { Site } from "../../data/site/site";
import { CreateSite } from "../../data/site/site.request";
import ModalForm from "../../components/ModalForm";
import RegisterSiteForm from "./components/RegisterSiteForm";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import Constants from "../../utils/Constants";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetGeneratedSiteCode,
  resetSiteUpdatedIndicator,
  selectSiteUpdatedIndicator,
  setGeneratedSiteCode,
} from "../../core/genericReducer";
import { generateShortUUID, getStatusAndText } from "../../utils/Extensions";
import { useSessionStorage } from "../../core/useSessionStorage";
import User from "../../data/user/user";
import { UnauthorizedRoute } from "../../utils/Routes";
import { FormInstance } from "antd/lib";
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
import UpdateSite from "./components/UpdateSite";
import { navigateWithProps } from "../../pagesRedesign/routes/RoutesExtensions";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import PaginatedList from "../../components/PaginatedList";

const SitesV2 = () => {
  const [getSites] = useGetCompanySitesMutation();
  const [getUserSites] = useGetUserSitesMutation();
  const location = useLocation();
  const [data, setData] = useState<Site[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [dataBackup, setDataBackup] = useState<Site[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerSite] = useCreateSiteMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isSiteUpdated = useAppSelector(selectSiteUpdatedIndicator);
  const [getSessionUser] = useSessionStorage<User>(Strings.empty);
  const navigate = useNavigate();
  const [siteURL, setSiteURL] = useState<string>();
  const [modalActions, setModalActions] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const { isIhAdmin } = useCurrentUser();
  const companyName = location?.state?.companyName || Strings.empty;
  const navigateProps = navigateWithProps();

  const handleGetSites = async () => {
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
    sessionStorage.setItem("companyInfo", JSON.stringify(companyInfo));

    const user = getSessionUser() as User;
    setLoading(true);
    var response;
    if (isIhAdmin()) {
      response = await getSites(location.state.companyId).unwrap();
    } else {
      response = await getUserSites(user.userId).unwrap();
    }
    setData(response);
    setDataBackup(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetSites();
  }, []);

  useEffect(() => {
    if (isSiteUpdated) {
      handleGetSites();
      dispatch(resetSiteUpdatedIndicator());
    }
  }, [isSiteUpdated, dispatch]);

  const handleOnSearch = (query: string) => {
    const getSearch = query;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));

      setData(filterData);
    } else {
      setData(dataBackup);
    }
  };

  const search = (item: Site, search: string) => {
    const { name, email } = item;

    return (
      email.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  };
  const isSiteCodeNotUnique = (siteCode: string): boolean => {
    return data.some((item) => item.siteCode === siteCode);
  };
  const handleOnClickCreateButton = () => {
    var uuid;
    do {
      uuid = generateShortUUID();
    } while (isSiteCodeNotUnique(uuid));
    dispatch(setGeneratedSiteCode(uuid));
    setModalOpen(true);
  };

  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      dispatch(resetGeneratedSiteCode());
      setModalOpen(false);
    }
  };

  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      if (siteURL == null || siteURL == undefined || siteURL == "") {
        handleErrorNotification(Strings.requiredLogo);
        setModalLoading(false);
        return;
      }

      await registerSite(
        new CreateSite(
          Number(location.state.companyId),
          values.siteCode,
          values.siteBusinessName,
          values.name,
          values.siteType,
          values.rfc,
          values.address,
          values.contact,
          values.position,
          values.phone.toString(),
          values.extension?.toString(),
          values.cellular?.toString(),
          values.email,
          siteURL,
          values.latitud.toString(),
          values.longitud.toString(),
          values.dueDate.format(Constants.DATE_FORMAT),
          values.monthlyPayment,
          values.currency,
          values.appHistoryDays,
          values.userLicense,
          values.userLicense === Strings.concurrente
            ? values.userQuantity
            : null
        )
      ).unwrap();
      setModalOpen(false);
      handleGetSites();
      handleSucccessNotification(NotificationSuccess.REGISTER);
      setSiteURL("");
    } catch (error) {
      console.error("Error creating site:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
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
        onCreateButtonClick={handleOnClickCreateButton}
        content={
          <div>
             <PaginatedList
                dataSource={data}
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
                          <UpdateSite siteId={value.id} />,
                          isIhAdmin() && (
                            <Button
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
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormCreateFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={(form: FormInstance) => (
            <RegisterSiteForm
              form={form}
              onSuccessUpload={(url) => setSiteURL(url)}
            />
          )}
          title={Strings.createSite.concat(` ${companyName}`)}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default SitesV2;
