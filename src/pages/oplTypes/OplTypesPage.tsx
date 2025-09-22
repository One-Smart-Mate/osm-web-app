import { useEffect, useState } from "react";
import { useGetOplTypesBySiteMutation } from "../../services/oplTypesService";
import { OplTypes } from "../../data/oplTypes/oplTypes";
import { List } from "antd";
import Strings from "../../utils/localizations/Strings";
import PaginatedList from "../components/PaginatedList";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import OplTypeForm, { OplTypeFormType } from "./components/OplTypeForm";
import OplTypeCard from "./components/OplTypeCard";
import { useAppSelector } from "../../core/store";
import { selectSiteId } from "../../core/genericReducer";

const OplTypesPage = () => {
  const [getOplTypesBySite] = useGetOplTypesBySiteMutation();
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<OplTypes[]>([]);
  const [dataBackup, setDataBackup] = useState<OplTypes[]>([]);
  const { isIhAdmin, user } = useCurrentUser();
  const siteIdFromSelector = useAppSelector(selectSiteId);

  // Get siteId from selector or from user's first site as fallback
  const siteId = siteIdFromSelector || (user?.sites?.[0]?.id);

  useEffect(() => {
    handleGetOplTypes();
  }, [siteId]); // Re-run when siteId changes

  const handleOnSearch = (query: string) => {
    const getSearch = query;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));
      setData(filterData);
    } else {
      setData(dataBackup);
    }
  };

  const search = (item: OplTypes, search: string) => {
    const { documentType } = item;

    return (
      documentType?.toLowerCase().includes(search.toLowerCase()) || false
    );
  };

  const handleGetOplTypes = async () => {
    if (!siteId) {
      return;
    }

    setLoading(true);
    try {
      const response = await getOplTypesBySite(Number(siteId)).unwrap();
      // Ensure response is always an array
      const safeData = Array.isArray(response) ? response : [];
      setData(safeData);
      setDataBackup(safeData);
    } catch (error) {
      console.error("Error fetching OPL types:", error);
      // Set empty array on error to prevent render issues
      setData([]);
      setDataBackup([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer
      title={Strings.oplTypesSB}
      description="" // Global catalog, no site-specific description
      enableCreateButton={true}
      createButtonComponent={
        <OplTypeForm
          formType={OplTypeFormType._CREATE}
          onComplete={() => handleGetOplTypes()}
        />
      }
      onSearchChange={handleOnSearch}
      enableSearch={true}
      enableBackButton={isIhAdmin()}
      isLoading={isLoading}
      content={
        <div>
          <PaginatedList
            className="no-scrollbar"
            dataSource={data}
            renderItem={(value: OplTypes, index: number) => (
              <List.Item key={index}>
                <OplTypeCard
                  oplType={value}
                  onComplete={() => handleGetOplTypes()}
                />
              </List.Item>
            )}
            loading={isLoading}
          />
        </div>
      }
    />
  );
};

export default OplTypesPage; 