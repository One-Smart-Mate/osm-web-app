import { useState } from "react";
import Strings from "../../../utils/localizations/Strings";
import { App as AntApp } from "antd";
import AnatomyNotification, {
  AnatomyNotificationType,
} from "../../components/AnatomyNotification";
import { CardTypeUpdateForm } from "../../../data/cardtypes/cardTypes";
import CardTypeFormCard from "./CardTypeFormCard";
import { useForm } from "antd/es/form/Form";
import {
  useCreateCardTypeMutation,
  useUpdateCardTypeMutation,
} from "../../../services/CardTypesService";
import {
  CreateCardType,
  UpdateCardTypeReq,
} from "../../../data/cardtypes/cardTypes.request";
import { useLocation } from "react-router-dom";
import Loading from "../../components/Loading";

interface CardTypeFormProps {
  formType: CardTypeFormType;
  data?: CardTypeUpdateForm;
  onComplete?: () => void;
}

export enum CardTypeFormType {
  _CREATE = "CREATE",
  _UPDATE = "UPDATE",
}

const CardTypeForm = ({ data, onComplete, formType }: CardTypeFormProps) => {
  const location = useLocation();
  const { notification } = AntApp.useApp();
  const [form] = useForm();
  const [createCardType] = useCreateCardTypeMutation();
  const [updateCardType] = useUpdateCardTypeMutation();
  const [isLoading, setLoading] = useState(false);


  const handleOnSubmit = async (values: any) => {
    setLoading(true);
    switch (formType) {
      case CardTypeFormType._CREATE:
        await handleOnCreate(values);
        break;
      case CardTypeFormType._UPDATE:
        await handleOnUpdate(values);
        break;
    }
  };

  const handleOnCreate = async (values: any) => {
    try {
      if (!values.cardTypeMethodology) {
        throw new Error(Strings.cardTypesMethodologyError);
      }

      const aux = values.cardTypeMethodology.split(" - ");
      const cardTypeMethodology = aux[1];
      const methodologyName = aux[0];

      const newCardType = new CreateCardType(
        cardTypeMethodology,
        Number(location.state.siteId),
        methodologyName,
        values.name?.trim() || Strings.empty,
        values.description?.trim() || Strings.empty,
        formatColor(values.color),
        Number(values.responsableId || 0),
        Number(values.quantityPicturesCreate || 0),
        Number(values.quantityAudiosCreate || 0),
        Number(values.quantityVideosCreate || 0),
        Number(values.audiosDurationCreate || 0),
        Number(values.videosDurationCreate || 0),
        Number(values.quantityPicturesClose || 0),
        Number(values.quantityAudiosClose || 0),
        Number(values.quantityVideosClose || 0),
        Number(values.audiosDurationClose || 0),
        Number(values.videosDurationClose || 0),
        Number(values.quantityPicturesPs || 0),
        Number(values.quantityAudiosPs || 0),
        Number(values.quantityVideosPs || 0),
        Number(values.audiosDurationPs || 0),
        Number(values.videosDurationPs || 0)
      );
      await createCardType(newCardType).unwrap();
      AnatomyNotification.success(
        notification,
        AnatomyNotificationType._REGISTER
      );
      form.resetFields();
      onComplete?.();
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnUpdate = async (values: any) => {
    try {
      const updatedCardType = new UpdateCardTypeReq(
        Number(values.id),
        values.methodology?.trim() || Strings.empty,
        values.name?.trim() || Strings.empty,
        values.description?.trim() || Strings.empty,
        formatColor(values.color),
        Number(values.responsableId || 0),
        Number(values.quantityPicturesCreate || 0),
        Number(values.quantityAudiosCreate || 0),
        Number(values.quantityVideosCreate || 0),
        Number(values.audiosDurationCreate || 0),
        Number(values.videosDurationCreate || 0),
        Number(values.quantityPicturesClose || 0),
        Number(values.quantityAudiosClose || 0),
        Number(values.quantityVideosClose || 0),
        Number(values.audiosDurationClose || 0),
        Number(values.videosDurationClose || 0),
        Number(values.quantityPicturesPs || 0),
        Number(values.quantityAudiosPs || 0),
        Number(values.quantityVideosPs || 0),
        Number(values.audiosDurationPs || 0),
        Number(values.videosDurationPs || 0),
        values.status || Strings.active.toUpperCase()
      );
      await updateCardType(updatedCardType).unwrap();
      AnatomyNotification.success(notification, AnatomyNotificationType._UPDATE);
      form.resetFields();
      onComplete?.();
    } catch (error) {
      AnatomyNotification.error(notification, error);
    } finally {
      setLoading(false);
    }
  };

  const formatColor = (colorValue: any) => {
    if (!colorValue) return "transparent";
    let c =
      typeof colorValue === "string"
        ? colorValue
        : colorValue?.toHex?.() || Strings.empty;
    return c.startsWith("#") ? c.slice(1) : c;
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      {!isLoading && (
        <CardTypeFormCard
          form={form}
          onSubmit={handleOnSubmit}
          initialValues={data}
          enableStatus={formType == CardTypeFormType._UPDATE}
        />
      )}
    </>
  );
};

export default CardTypeForm;
