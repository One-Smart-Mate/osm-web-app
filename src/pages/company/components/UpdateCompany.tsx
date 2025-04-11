import { useState } from "react";
import CustomButton from "../../../components/CustomButtons";
import Strings from "../../../utils/localizations/Strings";
import { Company } from "../../../data/company/company";
import UpdateCompanyForm from "./UpdateCompanyForm";
import { Form } from "antd";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import { useUpdateCompanyMutation } from "../../../services/companyService";
import { UpdateCompanyRequest } from "../../../data/company/company.request";
import { useAppDispatch } from "../../../core/store";
import {
  resetRowData,
  setCompanyUpdatedIndicator,
  setRowData,
} from "../../../core/genericReducer";
import ModalUpdateForm from "../../../components/ModalUpdateForm";

interface ButtonEditProps {
  data: Company;
}

const UpdateCompany = ({ data }: ButtonEditProps) => {
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalIsLoading, setModalLoading] = useState(false);
  const [updateCompany] = useUpdateCompanyMutation();
  const dispatch = useAppDispatch();

  //Edit modal
  const handleOnClickEditButton = () => {
    dispatch(setRowData(data));
    setModalOpen(true);
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
      let companyURL = values.logo;

      if (companyURL == null || companyURL == undefined || companyURL == "") {
        handleErrorNotification(Strings.requiredLogo);
        return;
      }
      const companyToUpdate = new UpdateCompanyRequest(
        Number(values.id),
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
      );
      await updateCompany(companyToUpdate).unwrap();
      setModalOpen(false);
      dispatch(setCompanyUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
      console.error("Error updating company:", error);
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
      <Form.Provider onFormFinish={async (_, { values }) => {await handleOnUpdateFormFinish(values)}}>
        <ModalUpdateForm
          open={modalIsOpen}
          onCancel={handleOnCancelButton}
          FormComponent={UpdateCompanyForm}
          title={Strings.updateCompany}
          isLoading={modalIsLoading}
        />
      </Form.Provider>
    </>
  );
};

export default UpdateCompany;
