import { Card, Form, FormInstance } from "antd";
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
import ModalForm from "../../components/ModalForm";
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
import ImagesPreviewGroup from "./ImagesPreviewGroup";
import { theme } from "antd";
import VideoPreviewGroup from "./VideoPreviewGroup";
import AudioPlayerPreviewGroup from "./AudioPlayerPreviewGroup";
import { useLocation } from "react-router-dom";
import Constants from "../../../utils/Constants";
import AnatomySection from "../../../pagesRedesign/components/AnatomySection";

const { useToken } = theme;

interface InfoTagCardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
  cardName?: any;
}

const InfoTagCard = ({ data, evidences, cardName }: InfoTagCardProps) => {
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

  const isCardClosed = cardStatus.text == Strings.closed;

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
      return (form: FormInstance) => <UpdatePriorityForm form={form} />;
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
        const mechanichId =
          values.mechanicId ??
          values.IH_sis_adminId ??
          values.local_adminId ??
          values.local_sis_adminId ??
          values.operatorId ??
          values.external_providerId;

        if (!mechanichId) {
          throw new Error("No user selected to asign");
        }
        await updateCardMechanic(
          new UpdateCardMechanic(
            Number(card.id),
            Number(mechanichId),
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

  const showEvidencesSection = (): boolean => {
    return hasImages(evidences) || hasVideos(evidences) || hasAudios(evidences)
  }

  return (
    <>
      <div className="p-2">
        <Card className="px-2 mt-3" hoverable>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4 border-b pb-4">
            <AnatomySection
              title={Strings.cardNumber}
              label={card.siteCardId || Strings.NA}
              justify={true}
            />

            <AnatomySection
              title={Strings.cardType}
              label={
                <span
                  className="font-semibold"
                  style={{ color: `#${card.cardTypeColor}` }}
                >
                  {card.cardTypeName}
                </span>
              }
              justify={true}
            />

            <AnatomySection
              title={Strings.status}
              label={
                <span
                  className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center"
                  style={{ backgroundColor: isCardClosed ? token["red-5"] : primaryColor }}
                >
                  {cardStatus.text}
                </span>
              }
              justify={true}
            />

            <AnatomySection
              title={Strings.priority}
              label={
                <span
                  onClick={() => 
                  {
                    if(!isCardClosed) {
                      handleOnOpenModal(Strings.priority)
                    }
                  }
                  }
                  className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center cursor-pointer hover:opacity-90"
                  style={{ backgroundColor:  primaryColor }}
                >
                  {card.priorityCode
                    ? `${card.priorityCode} - ${card.priorityDescription}`
                    : Strings.NA}
                </span>
              }
              justify={true}
            />

            <AnatomySection
              title={Strings.creationDate}
              label={formatDate(card.createdAt) || Strings.NA}
              justify={true}
            />

            <AnatomySection
              title={Strings.dueDate}
              label={card.cardDueDate || Strings.NA}
              justify={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4">
            <AnatomySection
              title={Strings.dateStatus}
              label={
                <span
                  className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center"
                  style={{
                    backgroundColor:
                      cardStatus.dateStatus === Strings.expired
                        ? "#e53e3e"
                        : "#38a169",
                  }}
                >
                  {cardStatus.dateStatus}
                </span>
              }
              justify={true}
            />

            <AnatomySection
              title={Strings.daysSinceCreation}
              label={getDaysSince(card.createdAt) || Strings.cero}
              justify={true}
            />

            <AnatomySection
              title={Strings.problemType}
              label={
                card.preclassifierCode
                  ? `${card.preclassifierCode} - ${card.preclassifierDescription}`
                  : Strings.NA
              }
              justify={true}
            />

            <AnatomySection
              title={Strings.location}
              label={card.cardLocation || Strings.NA}
              justify={true}
            />

            <AnatomySection
              title={Strings.responsible}
              label={
                <span
                  onClick={() => {
                    if(!isCardClosed) {
                      handleOnOpenModal(Strings.mechanic)
                    }
                  }}
                  className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {card.mechanicName || Strings.NA}
                </span>
              }
              justify={true}
            />

            <AnatomySection
              title={Strings.createdBy}
              label={card.creatorName || Strings.NA}
              justify={true}
            />
          </div>

          <AnatomySection
            title={Strings.anomalyDetected}
            label={card.commentsAtCardCreation || Strings.NA}
            justify={true}
          />
        </Card>
        {showEvidencesSection() && (
            <>
              <Divider
                orientation="left"
                className="text-xs my-2"
                style={{ borderColor: "#808080" }}
              >
                {Strings.evidencesAtCreationDivider}
              </Divider>
              <div className="flex flex-wrap  gap-2 mt-2">
                {hasImages(evidences) && <ImagesPreviewGroup data={evidences} />}
              </div>

              <div className="flex flex-wrap  gap-2 mt-2">
                {hasVideos(evidences) && <VideoPreviewGroup data={evidences} />}
              </div>

              <div className="flex flex-wrap  gap-2 mt-2">
                {hasAudios(evidences) && <AudioPlayerPreviewGroup data={evidences} />}
              </div>
            </>
          )}

        <Form.Provider
          onFormFinish={async (_, { values }) =>
            handleOnFormUpdateFinish(values)
          }
        >
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

export default InfoTagCard;
