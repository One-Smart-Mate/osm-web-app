import { useEffect, useState } from "react";
import {
  useCreateCompanyMutation,
  useGetCompaniesMutation,
} from "../../services/companyService";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Row,
  Space,
  Typography,
} from "antd";
import { Company } from "../../data/company/company";
import { IoIosSearch } from "react-icons/io";
import CustomButton from "../../components/CustomButtons";
import CompanyCard from "./components/CompanyCard";
import PaginatedList from "../../components/PaginatedList";
import CompanyTable from "./components/CompanyTable";
import RegisterCompanyForm from "./components/RegisterCompanyForm";
import ModalForm from "../../components/ModalForm";
import { CreateCompany } from "../../data/company/company.request";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import Strings from "../../utils/localizations/Strings";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetCompanyUpdatedIndicator,
  selectCompanyUpdatedIndicator,
} from "../../core/genericReducer";
import PageTitle from "../../components/PageTitle";
import { FormInstance } from "antd/lib";
import { getStatusAndText, isRedesign } from "../../utils/Extensions";
import PageTitleTag from "../../components/PageTitleTag";
import { BsBuildingAdd, BsDiagram3, BsFiles, BsMailbox, BsPerson, BsPinMap, BsSearch, BsTelephone, BsTelephoneOutbound } from "react-icons/bs";
import Loading from "../../pagesRedesign/components/Loading";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import ViewSitesButton from "./components/ViewSitesButton";
import UpdateCompany from "./components/UpdateCompany";

const Companies = () => {
  const [getCompanies] = useGetCompaniesMutation();
  const [data, setData] = useState<Company[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<Company[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerCompany] = useCreateCompanyMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isCompanyUpdated = useAppSelector(selectCompanyUpdatedIndicator);
  const [companyURL, setCompanyURL] = useState<string>();

  useEffect(() => {
    if (isCompanyUpdated) {
      handleGetCompanies();
      dispatch(resetCompanyUpdatedIndicator());
    }
  }, [isCompanyUpdated, dispatch]);

  const handleGetCompanies = async () => {
    setLoading(true);
    const response = await getCompanies().unwrap();
    setData(response);
    setDataBackup(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetCompanies();
  }, []);

  const handleOnSearch = (event: any) => {
    const getSearch = event.target.value;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));

      setData(filterData);
    } else {
      setData(dataBackup);
    }
    setQuerySearch(getSearch);
  };

  const search = (item: Company, search: string) => {
    const { name, email } = item;

    return (
      email.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleOnClickCreateButton = () => {
    setModalOpen(true);
  };

  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };

  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      if (companyURL == null || companyURL == undefined || companyURL == "") {
        handleErrorNotification(Strings.requiredLogo);
        setModalLoading(false);
        return;
      }
      await registerCompany(
        new CreateCompany(
          values.name,
          values.rfc,
          values.address,
          values.contact,
          values.position,
          values.phone.toString(),
          values.extension?.toString(),
          values.cellular?.toString(),
          values.email,
          companyURL
        )
      ).unwrap();
      setModalOpen(false);
      handleGetCompanies();
      handleSucccessNotification(NotificationSuccess.REGISTER);
      setCompanyURL("");
    } catch (error) {
      console.error("Error creating company:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return isRedesign() ? (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center m-3">
        <PageTitleTag mainText="" subText={Strings.companies} />
        <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
          <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
            <Space className="w-full md:w-auto mb-1 md:mb-0">
              <Input
                className="w-full"
                onChange={handleOnSearch}
                value={querySearch}
                placeholder={Strings.search}
                addonAfter={<BsSearch />}
              />
            </Space>
          </div>
          <div className="flex mb-1 md:mb-0 md:justify-end w-full md:w-auto">
            <Button
              onClick={handleOnClickCreateButton}
              className="w-full md:w-auto"
              type="primary"
            >
              {Strings.create}
            </Button>
          </div>
        </div>
      </div>
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
                  <Typography.Title level={5}>{value.name}</Typography.Title>
                }
                cover={<img alt={value.name} style={{width:'auto', height:200 }} src={value.logo} />}
                actions={[
                  <ViewSitesButton
                    companyId={value.id}
                    companyName={value.name}
                    companyAddress={value.address}
                    companyPhone={value.phone}
                    companyLogo={value.logo}
                  />,

                  <UpdateCompany data={value} />,
                ]}
              >
                <AnatomySection title={Strings.name} label={value.name} icon={<BsBuildingAdd />} />
                <AnatomySection title={Strings.rfc} label={value.rfc} icon={<BsFiles />} />
                <AnatomySection
                  title={Strings.companyAddress}
                  label={value.address}
                  icon={<BsPinMap />}
                />
                <AnatomySection title={Strings.contact} label={value.contact} icon={<BsPerson />} />
                <AnatomySection
                  title={Strings.position}
                  label={value.position}
                  icon={ <BsDiagram3 />}
                />
                <AnatomySection title={Strings.phone} label={value.phone} icon={<BsTelephone />} />
                <AnatomySection
                  title={Strings.extension}
                  label={value.extension}
                  icon={<BsTelephoneOutbound />}
                />
                <AnatomySection title={Strings.email} label={value.email} icon={ <BsMailbox />} />
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
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormCreateFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          title={Strings.createCompany}
          isLoading={modalIsLoading}
          FormComponent={(form: FormInstance) => (
            <RegisterCompanyForm
              form={form}
              onSuccessUpload={(url: string) => setCompanyURL(url)}
            />
          )}
        />
      </Form.Provider>
    </div>
  ) : (
    <div>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-2 items-center m-3">
          <PageTitle mainText={Strings.companiesUpperCase} />
          <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
            <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
              <Space className="w-full md:w-auto mb-1 md:mb-0">
                <Input
                  className="w-full"
                  onChange={handleOnSearch}
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
        </div>
        <div className="flex-1 overflow-auto hidden lg:block">
          <CompanyTable data={data} isLoading={isLoading} />
        </div>
        <div className="flex-1 overflow-auto lg:hidden">
          <PaginatedList
            dataSource={data}
            renderItem={(item: Company, index: number) => (
              <List.Item>
                <CompanyCard key={index} data={item} />
              </List.Item>
            )}
            loading={isLoading}
          />
        </div>
      </div>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormCreateFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          title={Strings.createCompany}
          isLoading={modalIsLoading}
          FormComponent={(form: FormInstance) => (
            <RegisterCompanyForm
              form={form}
              onSuccessUpload={(url: string) => setCompanyURL(url)}
            />
          )}
        />
      </Form.Provider>
    </div>
  );
};

export default Companies;
