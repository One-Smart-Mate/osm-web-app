import { useState } from "react";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import { Form, Spin } from "antd";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import { useAppDispatch } from "../../../core/store";
import {
  resetRowData,
  setRowData,
  setSiteUpdatedIndicator,
} from "../../../core/genericReducer";
import UpdateSiteForm from "./UpdateSiteForm";
import ModalUpdateForm from "../../../components/ModalUpdateForm";
import {
  useGetSiteMutation,
  useUpdateSiteMutation,
} from "../../../services/siteService";
import { UpdateSiteReq } from "../../../data/site/site.request";
import { updateImageToFirebaseAndGetURL } from "../../../config/firebaseUpdate";
import Constants from "../../../utils/Constants";

interface ButtonEditProps {
  siteId: string;
}

const UpdateSite = ({ siteId }: ButtonEditProps) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalIsLoading, setModalLoading] = useState(false);
  const [dataIsLoading, setDataLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [getSite] = useGetSiteMutation();
  const [updateSite] = useUpdateSiteMutation();

  const handleOnClickEditButton = async () => {
    setDataLoading(true);
    const site = await getSite(siteId).unwrap();
    dispatch(setRowData(site));
    setModalOpen(true);
    setDataLoading(false);
  };

  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      dispatch(resetRowData());
      setModalOpen(false);
    }
  };

  const handleOnUpdateFormFinish = async (values: any) => {
    try {
      setModalLoading(true);
      const siteToUpdate = new UpdateSiteReq(
        Number(values.id),
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
        values.logoURL,
        values.latitud,
        values.longitud,
        values.dueDate.format(Constants.DATE_FORMAT),
        Number(values.monthlyPayment),
        values.currency,
        Number(values.appHistoryDays),
        values.status
      );
      await updateSite(siteToUpdate).unwrap();
      let newURLLogo;
      if (values.logo[0] !== "h") {
        newURLLogo = await updateImageToFirebaseAndGetURL(
          Strings.sites,
          values.logoURL,
          values.logo[0]
        );
        siteToUpdate.logo = newURLLogo;
        await updateSite(siteToUpdate).unwrap();
      }
      setModalOpen(false);
      dispatch(setSiteUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
      console.log("Error occurred during site update:", error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <CustomButton onClick={handleOnClickEditButton} type="edit">
        {Strings.edit}
      </CustomButton>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnUpdateFormFinish(values);
        }}
      >
        <ModalUpdateForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={UpdateSiteForm}
          title={Strings.updateSite}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
      <Spin spinning={dataIsLoading} fullscreen />
    </>
  );
};

export default UpdateSite;
