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
  Col,
  Form,
  Input,
  List,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import CustomButton from "../../components/CustomButtons";
import SiteTable from "./components/SiteTable";
import { IoIosSearch } from "react-icons/io";
import PaginatedList from "../../components/PaginatedList";
import SiteCard from "./components/SiteCard";
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
import PageTitle from "../../components/PageTitle";
import {
  generateShortUUID,
  getStatusAndText,
  isRedesign,
  UserRoles,
} from "../../utils/Extensions";
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
import Loading from "../../pagesRedesign/components/Loading";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import UpdateSite from "./components/UpdateSite";
import { navigateWithProps } from "../../pagesRedesign/routes/RoutesExtensions";
import useCurrentUser from "../../utils/hooks/useCurrentUser";

interface SitesProps {
  rol: UserRoles;
}

const Sites = ({ rol }: SitesProps) => {
  const [getSites] = useGetCompanySitesMutation();
  const [getUserSites] = useGetUserSitesMutation();
  const location = useLocation();
  const [data, setData] = useState<Site[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [querySearch, setQuerySearch] = useState(Strings.empty);
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
  const { isIhAdmin} = useCurrentUser();
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
    setQuerySearch(getSearch);
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

  const buildSitePageActions = () => {
    if (rol === UserRoles.IHSISADMIN) {
      return (
        <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
          <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
            <Space className="w-full md:w-auto mb-1 md:mb-0">
              <Input
                className="w-full"
                onChange={(e) => handleOnSearch(e.target.value)}
                value={querySearch}
                addonAfter={<IoIosSearch />}
              />
            </Space>
          </div>
          <div className="flex mb-1 md:mb-0 md:justify-end w-full md:w-auto">
            <CustomButton
              type="success"
              onClick={handleOnClickCreateButton}
              className="w-full md:w-auto"
            >
              {Strings.create}
            </CustomButton>
          </div>
        </div>
      );
    }
    return null;
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
      {isRedesign() ? (
        <MainContainer
          title={`${
            isIhAdmin() ? Strings.sitesOf : Strings.yourSitesOfCompany
          }`}
          description={companyName}
          isLoading={isLoading}
          enableSearch={isIhAdmin()}
          onSearchChange={handleOnSearch}
          enableBackButton={isIhAdmin()}
          enableCreateButton={isIhAdmin()}
          onCreateButtonClick={handleOnClickCreateButton}
          content={
            <div>
              <Row gutter={[8, 8]}>
                <Loading isLoading={isLoading} />
                {!isLoading &&
                  data.map((value, index) => (
                    <Col
                      key={`Col-${index}`}
                      xs={{ flex: "100%" }}
                      sm={{ flex: "60%" }}
                      md={{ flex: "50%" }}
                      lg={{ flex: "40%" }}
                      xl={{ flex: "30%" }}
                    >
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
                          <Button onClick={() => {
                            setSelectedSite(value);
                            setModalActions(true)
                          }}>{Strings.actions}</Button>,
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
                    </Col>
                  ))}
              </Row>

              <Modal
                title={Strings.actions}
                open={modalActions}
                onOk={() => setModalActions(false)}
                onCancel={() => setModalActions(false)}
              >
                <Button onClick={() => {
                  navigateProps(Constants.ROUTES_PATH.charts,{siteId: selectedSite?.id, siteName: selectedSite?.name,})
                }}>{Strings.viewCharts}</Button>

              <Button onClick={() => {
                  navigateProps(Constants.ROUTES_PATH.users,{siteId: selectedSite?.id, siteName: selectedSite?.name,})
                }}>{Strings.viewUsers}</Button>
              </Modal>
            </div>
          }
        />
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex flex-col gap-2 items-center m-3">
            <PageTitle
              mainText={`${
                rol === UserRoles.IHSISADMIN
                  ? Strings.sitesOf
                  : Strings.yourSitesOfCompany
              }`}
              subText={companyName}
            />
            {buildSitePageActions()}
          </div>
          <div className="flex-1 overflow-auto hidden lg:block">
            <SiteTable data={data} isLoading={isLoading} rol={rol} />
          </div>
          <div className="flex-1 overflow-auto lg:hidden">
            <PaginatedList
              dataSource={data}
              renderItem={(item: Site, index: number) => (
                <List.Item>
                  <SiteCard key={index} data={item} rol={rol} />
                </List.Item>
              )}
              loading={isLoading}
            />
          </div>
        </div>
      )}
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

export default Sites;
