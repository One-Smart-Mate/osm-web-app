import { useEffect, useState } from "react";
import {
  useCreatePriorityMutation,
  useGetPrioritiesMutation,
} from "../../services/priorityService";
import { Priority } from "../../data/priority/priority";
import { Badge, Card, Form, List, Typography } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import ModalForm from "../../components/ModalForm";
import { CreatePriority } from "../../data/priority/priority.request";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import RegisterPriorityForm from "./components/RegisterPriorityForm";
import { useAppDispatch, useAppSelector } from "../../core/store";
import {
  resetPriorityUpdatedIndicator,
  selectPriorityUpdatedIndicator,
} from "../../core/genericReducer";
import PaginatedList from "../../components/PaginatedList";
import { UnauthorizedRoute } from "../../utils/Routes";
import { FormInstance } from "antd/lib";
import { getStatusAndText } from "../../utils/Extensions";
import UpdatePriority from "./components/UpdatePriority";
import AnatomySection from "../../pagesRedesign/components/AnatomySection";
import { BsCalendarCheck, BsClock, BsListNested } from "react-icons/bs";
import MainContainer from "../../pagesRedesign/layout/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";

const PrioritiesV2 = () => {
  const [getPriorities] = useGetPrioritiesMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<Priority[]>([]);
  const [dataBackup, setDataBackup] = useState<Priority[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerPriority] = useCreatePriorityMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isPriorityUpdated = useAppSelector(selectPriorityUpdatedIndicator);
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const { isIhAdmin } = useCurrentUser();

  useEffect(() => {
    if (isPriorityUpdated) {
      handleGetPriorities();
      dispatch(resetPriorityUpdatedIndicator());
    }
  }, [isPriorityUpdated, dispatch]);

  const handleOnClickCreateButton = () => {
    setModalOpen(true);
  };
  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };

  const handleOnSearch = (query: string) => {
    const getSearch = query;

    if (getSearch.length > 0) {
      const filterData = dataBackup.filter((item) => search(item, getSearch));

      setData(filterData);
    } else {
      setData(dataBackup);
    }
  };

  const search = (item: Priority, search: string) => {
    const { priorityCode, priorityDescription } = item;

    return (
      priorityCode.toLowerCase().includes(search.toLowerCase()) ||
      priorityDescription.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleGetPriorities = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    const response = await getPriorities(location.state.siteId).unwrap();
    setData(response);
    setDataBackup(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetPriorities();
  }, []);

  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      await registerPriority(
        new CreatePriority(
          Number(location?.state?.siteId),
          values.code.trim(),
          values.description.trim(),
          Number(values.daysNumber)
        )
      ).unwrap();
      setModalOpen(false);
      handleGetPriorities();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      console.log("Error occurred:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <MainContainer
      title={Strings.prioritiesOf}
      description={siteName}
      enableCreateButton={true}
      onCreateButtonClick={handleOnClickCreateButton}
      onSearchChange={handleOnSearch}
      enableSearch={true}
      enableBackButton={isIhAdmin()}
      isLoading={isLoading}
      content={
        <div>
         <PaginatedList
              dataSource={data}
              renderItem={(value: Priority, index: number) => (
                <List.Item key={index}>
                  <Card
                      hoverable
                      title={
                        <Typography.Title level={5}>
                          {value.priorityDescription}
                        </Typography.Title>
                      }
                      className="rounded-xl shadow-md"
                      actions={[<UpdatePriority priorityId={value.id} />]}
                    >
                      <AnatomySection
                        title={Strings.priority}
                        label={value.priorityCode}
                        icon={<BsCalendarCheck />}
                      />
                      <AnatomySection
                        title={Strings.description}
                        label={value.priorityDescription}
                        icon={<BsListNested />}
                      />
                      <AnatomySection
                        title={Strings.daysNumber}
                        label={value.priorityDays}
                        icon={<BsClock />}
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
          <Form.Provider
            onFormFinish={async (_, { values }) => {
              await handleOnFormCreateFinish(values);
            }}
          >
            <ModalForm
              open={modalIsOpen}
              onCancel={handleOnCancelButton}
              FormComponent={(form: FormInstance) => (
                <RegisterPriorityForm form={form} />
              )}
              title={Strings.createPriority.concat(` ${siteName}`)}
              isLoading={modalIsLoading}
            />
          </Form.Provider>
        </div>
      }
    />
  );
};

export default PrioritiesV2;
