import { useEffect, useState } from "react";
import {
  useCreateCompanyMutation,
  useGetCompaniesMutation,
} from "../../services/companyService";
import { Form, Input, List, Space } from "antd";
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
import { uploadImageToFirebaseAndGetURL } from "../../config/firebaseUpload";
import PageTitle from "../../components/PageTitle";


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
      const imgURL = await uploadImageToFirebaseAndGetURL(
        Strings.companies,
        values.logo[0]
      );
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
          imgURL
        )
      ).unwrap();
      setModalOpen(false);
      handleGetCompanies();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
     <div className="h-full flex flex-col">
        <div className="flex flex-col gap-2 items-center m-3">
          <PageTitle mainText={Strings.companiesUpperCase}/>
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
               <CompanyCard key={index} data={item}/>
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
          FormComponent={RegisterCompanyForm}
          title={Strings.createCompany}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default Companies;
