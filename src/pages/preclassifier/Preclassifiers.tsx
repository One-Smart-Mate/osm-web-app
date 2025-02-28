import { useEffect, useState } from "react";
import { Form, Input, List, Space } from "antd";
import { IoIosSearch } from "react-icons/io";
import Strings from "../../utils/localizations/Strings";
import CustomButton from "../../components/CustomButtons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useCreatePreclassifierMutation,
  useGetPreclassifiersMutation,
} from "../../services/preclassifierService";
import PreclassifierTable from "./components/PreclassifierTable";
import PaginatedList from "../../components/PaginatedList";
import PreclassifierCard from "./components/PreclassifierCard";
import ModalForm from "../../components/ModalForm";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import { CreatePreclassifier } from "../../data/preclassifier/preclassifier.request";
import RegisterPreclassifierForm from "./components/RegisterPreclassifierForm";
import PageTitle from "../../components/PageTitle";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetPreclassifierUpdatedIndicator,
  selectPreclassifierUpdatedIndicator,
} from "../../core/genericReducer";
import { UnauthorizedRoute } from "../../utils/Routes";
import Preclassifier from "../../data/preclassifier/preclassifier";

const Preclassifiers = () => {
  const [getPreclassifiers] = useGetPreclassifiersMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<Preclassifier[]>([]);
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<Preclassifier[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerPreclassifier] = useCreatePreclassifierMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isPreclassifierUpdated = useAppSelector(
    selectPreclassifierUpdatedIndicator
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isPreclassifierUpdated) {
      handleGetPriorities();
      dispatch(resetPreclassifierUpdatedIndicator());
    }
  }, [isPreclassifierUpdated, dispatch]);

  const handleOnClickCreateButton = () => {
    setModalOpen(true);
  };
  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };

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

  const search = (item: Preclassifier, search: string) => {
    const { preclassifierCode, preclassifierDescription } = item;

    return (
      preclassifierCode.toLowerCase().includes(search.toLowerCase()) ||
      preclassifierDescription.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleGetPriorities = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    const response = await getPreclassifiers(
      location.state.cardTypeId
    ).unwrap();
    setData(response);
    setDataBackup(response);

    setLoading(false);
  };

  useEffect(() => {
    handleGetPriorities();
  }, [location.state]);

  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      await registerPreclassifier(
        new CreatePreclassifier(
          values.code.trim(),
          values.description.trim(),
          Number(location.state.cardTypeId)
        )
      ).unwrap();
      setModalOpen(false);
      handleGetPriorities();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      console.log("Error occurred while registering preclassifier:", error)
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  const cardTypeName = location?.state?.cardTypeName || Strings.empty;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-2 items-center m-3">
          <PageTitle
            mainText={Strings.preclassifiersof}
            subText={cardTypeName}
          />
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
          <PreclassifierTable data={data} isLoading={isLoading} />
        </div>
        <div className="flex-1 overflow-auto lg:hidden">
          <PaginatedList
            dataSource={data}
            renderItem={(item: Preclassifier, index: number) => (
              <List.Item>
                <PreclassifierCard key={index} data={item} />
              </List.Item>
            )}
            loading={isLoading}
          />
        </div>
        <Form.Provider
          onFormFinish={async (_, { values }) => {
            await handleOnFormCreateFinish(values);
          }}
        >
          <ModalForm
            open={modalIsOpen}
            onCancel={handleOnCancelButton}
            FormComponent={RegisterPreclassifierForm}
            title={Strings.createPreclassifier}
            isLoading={modalIsLoading}
          />
        </Form.Provider>
      </div>
    </>
  );
};

export default Preclassifiers;
