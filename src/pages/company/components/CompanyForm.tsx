import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { Company } from "../../../data/company/company";
import { Button } from "antd";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import {
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
} from "../../../services/companyService";
import {
  CreateCompany,
  UpdateCompanyRequest,
} from "../../../data/company/company.request";
import { useAppDispatch } from "../../../core/store";
import { resetRowData, setRowData } from "../../../core/genericReducer";
import ModalForm from "../../../components/ModalForm";
import { FormInstance } from "antd/lib";
import CompanyFormCard from "./CompanyFormCard";

interface CompanyFormProps {
  formType: CompanyFormType;
  data?: Company;
  onComplete?: () => void;
}

export enum CompanyFormType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

const CompanyForm = ({ data, onComplete, formType }: CompanyFormProps) => {
  const [registerCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();

  const dispatch = useAppDispatch();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<string>();

  const handleOnClickButton = () => {
    dispatch(setRowData(data));
    setModalOpen(true);
  };

  const handleOnCancelButton = () => {
    if (!isLoading) {
      dispatch(resetRowData());
      setModalOpen(false);
    }
  };

  const handleOnSubmit = async (values: any) => {
    switch (formType) {
      case CompanyFormType.CREATE:
        await handleOnCreate(values);
        break;
      case CompanyFormType.UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      setIsLoading(true);
      if (logo == null || logo == undefined || logo == "") {
        handleErrorNotification(Strings.requiredLogo);
        setIsLoading(false);
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
          logo
        )
      ).unwrap();
      setModalOpen(false);
      onComplete?.();
      handleSucccessNotification(NotificationSuccess.REGISTER);
      setLogo("");
    } catch (error) {
      console.error("Error creating company:", error);
      handleErrorNotification(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnUpdate = async (values: any) => {
    try {
      setIsLoading(true);
      if (logo == null || logo == undefined || logo == "") {
        handleErrorNotification(Strings.requiredLogo);
        setIsLoading(false);
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
        logo
      );
      await updateCompany(companyToUpdate).unwrap();
      setModalOpen(false);
      onComplete?.();
      handleSucccessNotification(NotificationSuccess.UPDATE);
      setLogo("");
    } catch (error) {
      console.error("Error updating company:", error);
      handleErrorNotification(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOnClickButton} type={formType == CompanyFormType.CREATE ? 'primary' : 'default'}>
        {formType == CompanyFormType.CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={Strings.createCompany}
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <CompanyFormCard
            form={form}
            onSubmit={handleOnSubmit}
            onSuccessUpload={(url: string) => setLogo(url)}
            initialValues={data}
          />
        )}
      />
    </>
  );
};

export default CompanyForm;
