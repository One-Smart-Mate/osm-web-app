import { Form, FormInstance } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  getDaysSince,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import { CardDetailsInterface, Evidences } from "../../../data/card/card";
import ModalForm from "../../../components/ModalForm";
import { useState } from "react";
import UpdatePriorityForm from "./UpdatePriorityForm";
import {
  useUpdateCardMechanicMutation,
  useUpdateCardPriorityMutation,
} from "../../../services/cardService";
import {
  UpdateCardMechanic,
  UpdateCardPriority,
} from "../../../data/card/card.request";
import { useAppDispatch, useAppSelector } from "../../../core/store";
import { selectCurrentUser } from "../../../core/authReducer";
import {
  handleErrorNotification,
  handleSucccessNotification,
  NotificationSuccess,
} from "../../../utils/Notifications";
import { setCardUpdatedIndicator } from "../../../core/genericReducer";
import UpdateMechanicForm from "./UpdateMechanicForm";
import { Divider } from "antd";
import ImagesDisplayV2 from "./ImagesDisplayV2";
import { theme } from "antd";
import VideoPlayerV2 from "./VideoPlayerV2";
import AudioPlayer from "./AudioPlayer";
import { useLocation } from "react-router-dom";
import Constants from "../../../utils/Constants";

const { useToken } = theme;

interface CardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
  cardName?: any;
}

const InfoCollapseV2 = ({ data, evidences, cardName }: CardProps) => {
  const location = useLocation();
  const isPublicRoute = location.pathname.includes(
    Constants.externalProviderRouteVal
  );
  const [modalIsLoading, setModalLoading] = useState(false);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(Strings.empty);
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateCardPriority] = useUpdateCardPriorityMutation();
  const [updateCardMechanic] = useUpdateCardMechanicMutation();
  const dispatch = useAppDispatch();
  const { token } = useToken();
  const primaryColor = token.colorPrimary;

  const { card } = data;
  const cardStatus = getCardStatusAndText(
    card.status,
    card.cardDueDate,
    card.cardDefinitiveSolutionDate,
    card.cardCreationDate
  );

  const handleOnOpenModal = (modalType: string) => {
    if (!isPublicRoute) {
      setModalOpen(true);
      setModalType(modalType);
    }
  };

  const handleOnCancelButton = () => {
    if (!modalIsLoading) {
      setModalOpen(false);
    }
  };

  const selectFormByModalType = (modalType: string) => {
    if (modalType === Strings.priority) {
      return UpdatePriorityForm;
    } else {
      return (form: FormInstance) => (
        <UpdateMechanicForm
          form={form}
          card={data.card}
          cardId={Number(data.card.id)}
          cardName={cardName}
        />
      );
    }
  };

  const selecTitleByModalType = (modalType: string) => {
    if (modalType === Strings.priority) {
      return Strings.updatePriority;
    } else {
      return Strings.assignUser;
    }
  };

  const handleOnFormUpdateFinish = async (values: any) => {
    try {
      setModalLoading(true);
      if (modalType === Strings.priority) {
        await updateCardPriority(
          new UpdateCardPriority(
            Number(card.id),
            Number(values.priorityId),
            Number(currentUser.userId)
          )
        ).unwrap();
      } else {
        const finalMechanicId =
          values.mechanicId ??
          values.IH_sis_adminId ??
          values.local_adminId ??
          values.local_sis_adminId ??
          values.operatorId ??
          values.external_providerId;

        if (!finalMechanicId) {
          throw new Error("No user selected to asign");
        }
        await updateCardMechanic(
          new UpdateCardMechanic(
            Number(card.id),
            Number(finalMechanicId),
            Number(currentUser.userId)
          )
        ).unwrap();
      }
      setModalOpen(false);
      dispatch(setCardUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
      console.log(error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <div className="px-2 mt-3">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4 border-b pb-4">
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Número de Tarjeta:</span>
              <span className="font-semibold">{card.siteCardId || Strings.NA}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Tipo de Tarjeta:</span>
              <span className="font-semibold" style={{ color: `#${card.cardTypeColor}` }}>
                {card.cardTypeName}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center justify-between">
              <span className="text-gray-600 mr-2">Estado:</span>
              <span
                className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center"
                style={{ backgroundColor: primaryColor }}
              >
                {cardStatus.text}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center justify-between">
              <span className="text-gray-600 mr-2">Prioridad:</span>
              <span
                onClick={() => handleOnOpenModal(Strings.priority)}
                className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center cursor-pointer hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {card.priorityCode
                  ? `${card.priorityCode} - ${card.priorityDescription}`
                  : Strings.NA}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Fecha de creación:</span>
              <span className="font-semibold">{formatDate(card.createdAt) || Strings.NA}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Fecha de vencimiento:</span>
              <span className="font-semibold">{card.cardDueDate || Strings.NA}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 p-2 rounded-sm flex items-center justify-between">
              <span className="text-gray-600 mr-2">Estado de la fecha:</span>
              <span
                className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center"
                style={{
                  backgroundColor:
                    cardStatus.dateStatus === Strings.expired ? "#e53e3e" : "#38a169",
                }}
              >
                {cardStatus.dateStatus}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Días desde la creación:</span>
              <span className="font-semibold">{getDaysSince(card.createdAt) || Strings.cero}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Tipo de problema:</span>
              <span className="font-semibold">
                {card.preclassifierCode
                  ? `${card.preclassifierCode} - ${card.preclassifierDescription}`
                  : Strings.NA}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Ubicación:</span>
              <span className="font-semibold">{card.cardLocation || Strings.NA}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center justify-between">
              <span className="text-gray-600 mr-2">Responsable:</span>
              <span
                onClick={() => handleOnOpenModal(Strings.mechanic)}
                className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center cursor-pointer hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {card.mechanicName || Strings.NA}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-sm flex items-center">
              <span className="text-gray-600 mr-2">Creado por:</span>
              <span className="font-semibold">{card.creatorName || Strings.NA}</span>
            </div>
          </div>
          <div className="border-t pt-4 flex flex-col sm:flex-row gap-3 items-center">
            <span className="text-gray-600 mr-2">Anomalía detectada:</span>
            <div className="bg-gray-50 p-2 rounded-sm flex-1 max-w-[350px]">
              {card.commentsAtCardCreation || Strings.NA}
            </div>
          </div>
        </div>
        <Divider orientation="left" className="text-xs my-2" style={{ borderColor: "#808080" }}>
          {Strings.evidencesAtCreationDivider}
        </Divider>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {evidences.length === 0 && <p className="text-gray-600 text-sm">{Strings.NA}</p>}
          {hasImages(evidences) && <ImagesDisplayV2 data={evidences} />}
          {hasVideos(evidences) && <VideoPlayerV2 data={evidences} />}
          {hasAudios(evidences) && <AudioPlayer data={evidences} />}
        </div>
        <Form.Provider onFormFinish={async (_, { values }) => handleOnFormUpdateFinish(values)}>
          <ModalForm
            open={modalIsOpen}
            isLoading={modalIsLoading}
            onCancel={handleOnCancelButton}
            title={selecTitleByModalType(modalType)}
            FormComponent={selectFormByModalType(modalType)}
          />
        </Form.Provider>
      </div>
    </>
  );  
};

export default InfoCollapseV2;
