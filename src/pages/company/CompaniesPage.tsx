import { useEffect, useState } from "react";
import { useGetCompaniesMutation } from "../../services/companyService";
import { List } from "antd";
import { Company } from "../../data/company/company";
import Strings from "../../utils/localizations/Strings";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetCompanyUpdatedIndicator,
  selectCompanyUpdatedIndicator,
} from "../../core/genericReducer";
import CompanyForm, { CompanyFormType } from "./components/CompanyForm";
import MainContainer from "../layouts/MainContainer";
import PaginatedList from "../components/PaginatedList";
import CompanyCard from "./components/CompanyCard";

const CompaniesPage = () => {
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
      title={'OSM'}
      description={Strings.companies}
      enableCreateButton={true}
      enableSearch={true}
      onSearchChange={handleOnSearch}
      isLoading={isLoading}
      createButtonComponent={
        <CompanyForm
          onComplete={() => handleGetCompanies()}
          formType={CompanyFormType._CREATE}
        />
      }
      content={
        <>
          <PaginatedList
            dataSource={data}
            className="no-scrollbar"
            renderItem={(value: Company, index: number) => (
              <List.Item key={index}>
                <CompanyCard company={value} onComplete={() => handleGetCompanies()} />
              </List.Item>
            )}
            loading={isLoading}
          />
        </>
      }
    />
  );
};

export default CompaniesPage;
