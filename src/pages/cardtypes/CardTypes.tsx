import { Drawer, Dropdown, Form, Spin, notification } from "antd";
import { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import { useLocation, useNavigate } from "react-router-dom";
import CardTypesTable from "./components/CardTypesTable";
import { CardTypes } from "../../data/cardtypes/cardTypes";
import PaginatedList from "../../components/PaginatedList";
import CardTypesCard from "./components/CardTypesCard";
import ModalForm from "../../components/ModalForm";
import RegisterCardTypeForm from "./components/RegisterCardTypeForm";
import { CreateCardType } from "../../data/cardtypes/cardTypes.request";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../utils/Notifications";
import {
  resetCardTypeUpdatedIndicator,
  selectCardTypeUpdatedIndicator,
  setSiteId,
} from "../../core/genericReducer";
import { useAppDispatch, useAppSelector } from "../../core/store";
import PageTitle from "../../components/PageTitle";
import { UserRoles } from "../../utils/Extensions";
import { UnauthorizedRoute } from "../../utils/Routes";
import { useCreateCardTypeMutation, useGetCardTypesMutation } from "../../services/CardTypesService";

interface CardTypeProps {
  rol: UserRoles;
}

const CardTypess = ({ rol }: CardTypeProps) => {
  const [getCardTypes] = useGetCardTypesMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<CardTypes[]>([]);
  const [querySearch, setQuerySearch] = useState(Strings.empty);
  const [dataBackup, setDataBackup] = useState<CardTypes[]>([]);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [registerCardType] = useCreateCardTypeMutation();
  const [modalIsLoading, setModalLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isCardTypeUpdated = useAppSelector(selectCardTypeUpdatedIndicator);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCardTypeUpdated) {
      handleGetPriorities();
      dispatch(resetCardTypeUpdatedIndicator());
    }
  }, [isCardTypeUpdated, dispatch]);

  const handleLoadData = async (siteId: string) => {
    setLoading(true);
    try {
      const cardTypesResponse = await getCardTypes(siteId).unwrap();

      const promises = cardTypesResponse.map(async (ct) => {
        const preclassResp = await getPreclassifiers(String(ct.id)).unwrap();
        return { cardTypeId: ct.id, preclassifiers: preclassResp };
      });

      const results = await Promise.all(promises);
      const preclassMap: { [key: string]: any[] } = {};

      results.forEach((r) => {
        preclassMap[r.cardTypeId] = r.preclassifiers;
      });

      const hierarchy = buildHierarchy(cardTypesResponse, siteId, preclassMap);
      setTreeData([
        {
          name: `${Strings.cardType} ${location.state.siteName}`,
          nodeType: "cardType",
          children: hierarchy,
        },
      ]);

      dispatch(setSiteId(siteId));

      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setTranslate({ x: offsetWidth / 2, y: offsetHeight / 4 });
      }
    } catch (err) {
      console.error(Strings.cardTypesErrorFetchingData, err);
      notification.error({
        message: "Error",
        description: "Error fetching data",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setDrawerType(null);
    setFormData(null);
    setSelectedNode(null);

    createForm.resetFields();
    updateForm.resetFields();
    createPreForm.resetFields();
    updatePreForm.resetFields();
  };

  const search = (item: CardTypes, search: string) => {
    const { name, methodology } = item;

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      methodology.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleGetPriorities = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    const response = await getCardTypes(location.state.siteId).unwrap();
    setData(response);
    setDataBackup(response);
    dispatch(setSiteId(location.state.siteId));
    setLoading(false);
  };

  useEffect(() => {
    handleGetPriorities();
  }, [location.state]);

  const handleOnFormCreateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      const aux = values.cardTypeMethodology.split(" - ");
      const cardTypeMethodology = aux[1];
      const methodologyName = aux[0];
      await registerCardType(
        new CreateCardType(
          cardTypeMethodology,
          Number(location.state.siteId),
          methodologyName,
          values.name.trim(),
          values.description.trim(),
          values.color.toHex(),
          Number(values.responsableId),
          Number(values.quantityPicturesCreate),
          Number(values.quantityAudiosCreate),
          Number(values.quantityVideosCreate),
          Number(values.audiosDurationCreate),
          Number(values.videosDurationCreate),
          Number(values.quantityPicturesClose),
          Number(values.quantityAudiosClose),
          Number(values.quantityVideosClose),
          Number(values.audiosDurationClose),
          Number(values.videosDurationClose),
          Number(values.quantityPicturesPs),
          Number(values.quantityAudiosPs),
          Number(values.quantityVideosPs),
          Number(values.audiosDurationPs),
          Number(values.videosDurationPs)
        )
      ).unwrap();
      setModalOpen(false);
      handleGetPriorities();
      handleSucccessNotification(NotificationSuccess.REGISTER);
    } catch (error) {
      console.error("Error in form submission:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  const siteName = location?.state?.siteName || Strings.empty;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-2 items-center m-3">
          <PageTitle mainText={Strings.cardTypesOf} subText={siteName} />
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
          <CardTypesTable data={data} isLoading={isLoading} rol={rol} />
        </div>
        <div className="flex-1 overflow-auto lg:hidden">
          <PaginatedList
            dataSource={data}
            renderItem={(item: CardTypes, index: number) => (
              <List.Item>
                <CardTypesCard key={index} data={item} rol={rol} />
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
          FormComponent={RegisterCardTypeForm}
          title={Strings.createCardType.concat(` ${siteName}`)}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default CardTypess;
