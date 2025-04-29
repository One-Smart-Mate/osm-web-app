import { useEffect, useState } from "react";
import { useGetCompaniesMutation } from "../../services/companyService";
import { Badge, Card, List, Typography } from "antd";
import { Company } from "../../data/company/company";
import Strings from "../../utils/localizations/Strings";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetCompanyUpdatedIndicator,
  selectCompanyUpdatedIndicator,
} from "../../core/genericReducer";
import { getStatusAndText } from "../../utils/Extensions";
import {
  BsBuildingAdd,
  BsDiagram3,
  BsFiles,
  BsMailbox,
  BsPerson,
  BsPhone,
  BsPinMap,
  BsTelephone,
  BsTelephoneOutbound,
} from "react-icons/bs";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import ViewSitesButton from "./components/ViewSitesButton";
import CompanyForm, { CompanyFormType } from "./components/CompanyForm";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import PaginatedList from "../../components/PaginatedList";

const CompaniesV2 = () => {
  const [getCompanies] = useGetCompaniesMutation();
  const [data, setData] = useState<Company[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [dataBackup, setDataBackup] = useState<Company[]>([]);
  const dispatch = useAppDispatch();
  const isCompanyUpdated = useAppSelector(selectCompanyUpdatedIndicator);
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
  };

  const search = (item: Company, search: string) => {
    const { name, email } = item;

    return (
      email.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <MainContainer
      title=""
      description={Strings.companies}
      enableCreateButton={true}
      enableSearch={true}
      onSearchChange={handleOnSearch}
      isLoading={isLoading}
      createButtonComponent={
        <CompanyForm
          onComplete={() => handleGetCompanies()}
          formType={CompanyFormType.CREATE}
        />
      }
      content={
        <>
          <PaginatedList
            dataSource={data}
            renderItem={(value: Company, index: number) => (
              <List.Item key={index}>
                <Card
                  hoverable
                  className="rounded-xl shadow-md"
                  title={
                    <Typography.Title level={5}>{value.name}</Typography.Title>
                  }
                  cover={
                    <img
                      alt={value.name}
                      style={{ width: "auto", height: 200 }}
                      src={value.logo}
                    />
                  }
                  actions={[
                    <ViewSitesButton
                      companyId={value.id}
                      companyName={value.name}
                      companyAddress={value.address}
                      companyPhone={value.phone}
                      companyLogo={value.logo}
                    />,

                    <CompanyForm
                      onComplete={() => handleGetCompanies()}
                      formType={CompanyFormType.UPDATE}
                      data={value}
                    />,
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
                    icon={<BsPhone />}
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
        </>
      }
    />
    //   <div className="h-full flex flex-col">
    //   <div className="flex flex-col items-center m-3">
    //     <PageTitleTag mainText="" subText={Strings.companies} />
    //     <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
    //       <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
    //         <Space className="w-full md:w-auto mb-1 md:mb-0">
    //           <Input
    //             className="w-full"
    //             onChange={handleOnSearch}
    //             value={querySearch}
    //             placeholder={Strings.search}
    //             addonAfter={<BsSearch />}
    //           />
    //         </Space>
    //       </div>
    //       <div className="flex mb-1 md:mb-0 md:justify-end w-full md:w-auto">
    //         <CompanyForm onComplete={() => handleGetCompanies()} formType={CompanyFormType.CREATE} />
    //       </div>
    //     </div>
    //   </div>
    // <Row gutter={[8, 8]}>
    //   <Loading isLoading={isLoading} />
    //   {!isLoading &&
    //     data.map((value, index) => (
    //       <Col
    //         key={`Col-${index}`}
    //         xs={{ flex: "100%" }}
    //         sm={{ flex: "60%" }}
    //         md={{ flex: "50%" }}
    //         lg={{ flex: "40%" }}
    //         xl={{ flex: "30%" }}
    //       >
    //         <Card
    //           hoverable
    //           className="rounded-xl shadow-md"
    //           title={
    //             <Typography.Title level={5}>{value.name}</Typography.Title>
    //           }
    //           cover={<img alt={value.name} style={{width:'auto', height:200 }} src={value.logo} />}
    //           actions={[
    //             <ViewSitesButton
    //               companyId={value.id}
    //               companyName={value.name}
    //               companyAddress={value.address}
    //               companyPhone={value.phone}
    //               companyLogo={value.logo}
    //             />,

    //             <CompanyForm onComplete={() => handleGetCompanies()} formType={CompanyFormType.UPDATE} data={value} />
    //           ]}
    //         >
    //           <AnatomySection title={Strings.name} label={value.name} icon={<BsBuildingAdd />} />
    //           <AnatomySection title={Strings.rfc} label={value.rfc} icon={<BsFiles />} />
    //           <AnatomySection
    //             title={Strings.companyAddress}
    //             label={value.address}
    //             icon={<BsPinMap />}
    //           />
    //           <AnatomySection title={Strings.contact} label={value.contact} icon={<BsPerson />} />
    //           <AnatomySection
    //             title={Strings.position}
    //             label={value.position}
    //             icon={ <BsDiagram3 />}
    //           />
    //           <AnatomySection title={Strings.phone} label={value.phone} icon={<BsTelephone />} />
    //           <AnatomySection
    //             title={Strings.extension}
    //             label={value.extension}
    //             icon={<BsTelephoneOutbound />}
    //           />
    //           <AnatomySection title={Strings.email} label={value.email} icon={ <BsMailbox />} />
    //           <AnatomySection
    //             title={Strings.cellular}
    //             label={value.cellular}
    //             icon={<BsPhone />}
    //           />
    //           <AnatomySection
    //             title={Strings.status}
    //             label={
    //               <Badge
    //                 status={getStatusAndText(value.status).status}
    //                 text={getStatusAndText(value.status).text}
    //               />
    //             }
    //           />
    //         </Card>
    //       </Col>
    //     ))}
    // </Row>

    // </div>
  );
};

export default CompaniesV2;
