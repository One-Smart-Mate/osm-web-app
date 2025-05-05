import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { Button } from "antd";
import {
  NotificationSuccess,
  handleErrorNotification,
  handleSucccessNotification,
} from "../../../utils/Notifications";
import ModalForm from "../../../components/ModalForm";
import { FormInstance } from "antd/lib";
import { Site } from "../../../data/user/user";
import SiteFormCard from "./SiteFormCard";
import {
  useCreateSiteMutation,
  useGetSiteMutation,
  useUpdateSiteMutation,
} from "../../../services/siteService";
import { SiteUpdateForm } from "../../../data/site/site";
import { CreateSite, UpdateSiteReq } from "../../../data/site/site.request";
import Constants from "../../../utils/Constants";
import { useLocation } from "react-router-dom";

interface SiteFormProps {
  formType: SiteFormType;
  data?: Site;
  onComplete?: () => void;
  companyName: string;
}

export enum SiteFormType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}

const SiteForm = ({
  data,
  onComplete,
  formType,
  companyName,
}: SiteFormProps) => {
  const [registerSite] = useCreateSiteMutation();
  const [updateSite] = useUpdateSiteMutation();
  const [modalIsOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<string>();
  const [getSite] = useGetSiteMutation();
  const [currentSite, setCurrentSite] = useState<SiteUpdateForm>();
  const location = useLocation();

  const handleOnClickButton = async () => {
    if (formType == SiteFormType.UPDATE) {
      const site = await getSite(data?.id ?? "").unwrap();
      console.log(site);
      setCurrentSite(site);
      setModalOpen(true);
    } else {
      setModalOpen(true);
    }
  };

  const handleOnCancelButton = () => {
    if (!isLoading) {
      setModalOpen(false);
    }
  };

  const handleOnSubmit = async (values: any) => {
    switch (formType) {
      case SiteFormType.CREATE:
        await handleOnCreate(values);
        break;
      case SiteFormType.UPDATE:
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

      const request = new CreateSite(
        Number(location.state.companyId),
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
        logo,
        values.latitud.toString(),
        values.longitud.toString(),
        values.dueDate.format(Constants.DATE_FORMAT),
        values.monthlyPayment,
        values.currency,
        values.appHistoryDays,
        values.userLicense,
        values.userLicense === Strings.concurrente ? values.userQuantity : null
      );
      await registerSite(request).unwrap();
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
      const request = new UpdateSiteReq(
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
        logo,
        values.latitud,
        values.longitud,
        values.dueDate.format(Constants.DATE_FORMAT),
        Number(values.monthlyPayment),
        values.currency,
        Number(values.appHistoryDays),
        values.status
      );
      await updateSite(request).unwrap();
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
      <Button
        onClick={handleOnClickButton}
        type='primary'
      >
        {formType == SiteFormType.CREATE ? Strings.create : Strings.edit}
      </Button>
      <ModalForm
        open={modalIsOpen}
        onCancel={handleOnCancelButton}
        title={Strings.createSite.concat(` ${companyName}`)}
        isLoading={isLoading}
        FormComponent={(form: FormInstance) => (
          <SiteFormCard
            form={form}
            onSubmit={handleOnSubmit}
            onSuccessUpload={(url: string) => setLogo(url)}
            initialValues={currentSite}
          />
        )}
      />
    </>
  );
};

export default SiteForm;
