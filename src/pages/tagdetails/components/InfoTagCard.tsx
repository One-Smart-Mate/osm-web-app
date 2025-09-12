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
import TagStatus from "../../components/TagStatus";
import { useGetAmDiscardReasonsQuery } from "../../../services/amDiscardReasonService";

const { useToken } = theme;

export interface InfoTagCardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
  cardName?: any;
  onOpenModal?: (_modalType: string) => void;
}

const InfoTagCard = ({ data, evidences, cardName, onOpenModal }: InfoTagCardProps) => {
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

  // Get discard reasons for lookup
  const {
    data: discardReasons = [],
  } = useGetAmDiscardReasonsQuery(Number(data.card.siteId), {
    skip: !data.card.siteId || !(data.card as any).amDiscardReasonId,
  });

  // Function to get discard reason name by ID
  const getDiscardReasonName = (amDiscardReasonId: number): string => {
    const reason = discardReasons.find(r => r.id === amDiscardReasonId);
    return reason?.discardReason || Strings.NA;
  };

  const handleOnOpenModal = (modalType: string) => {
    console.log("handleOnOpenModal called with type:", modalType);
    if (!isPublicRoute) {
      if (onOpenModal) {
        // Use external modal handler if provided (e.g., from AMTagViewerModal)
        onOpenModal(modalType);
      } else {
        // Use internal modal handler (original behavior)
        setModalOpen(true);
        setModalType(modalType);
      }
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
      handleSucccessNotification(NotificationSuccess._UPDATE);
    } catch (error) {
      console.log(error);
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  const showEvidencesSection = (): boolean => {
    return hasImages(evidences) || hasVideos(evidences) || hasAudios(evidences);
  };

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

            <TagStatus card={data.card} justify={true} />

            <AnatomySection
              title={Strings.priority}
              label={
                <span
                  onClick={() => {
                    if (!isCardClosed) {
                      handleOnOpenModal(Strings.priority);
                    }
                  }}
                  className="inline-block text-white font-medium py-1 px-2 rounded-sm min-w-[80px] text-center cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
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
                    console.log("Assign responsible clicked. Card closed:", isCardClosed);
                    if (!isCardClosed) {
                      handleOnOpenModal(Strings.mechanic);
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

          {/* Manager Information Section - Only show if there's discard information */}
          {((card as any).amDiscardReasonId || (card as any).discardReason || (card as any).managerName) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4 border-t pt-4 mt-4">
                {(card as any).managerName && (
                  <AnatomySection
                    title="Descartada por"
                    label={(card as any).managerName || Strings.NA}
                    justify={true}
                  />
                )}

                {((card as any).amDiscardReasonId || (card as any).discardReason) && (
                  <AnatomySection
                    title={Strings.discardReason}
                    label={
                      (card as any).amDiscardReasonId 
                        ? getDiscardReasonName((card as any).amDiscardReasonId)
                        : (
                            // Fallback to discardReason field, but check for test data
                            (card as any).discardReason && 
                            !(card as any).discardReason.includes("User confirmed") && 
                            !(card as any).discardReason.includes("duplicate") &&
                            !(card as any).discardReason.toLowerCase().includes("example") &&
                            !(card as any).discardReason.toLowerCase().includes("test")
                              ? (card as any).discardReason
                              : Strings.NA
                          )
                    }
                    justify={true}
                  />
                )}

                {(card as any).cardManagerCloseDate && (
                  <AnatomySection
                    title={Strings.managerCloseDate}
                    label={formatDate((card as any).cardManagerCloseDate) || Strings.NA}
                    justify={true}
                  />
                )}

                {(card as any).commentsManagerAtCardClose && (card as any).commentsManagerAtCardClose.trim() !== "" && (
                  <div className="col-span-full">
                    <AnatomySection
                      title={Strings.commentsManagerAtCardClose}
                      label={(card as any).commentsManagerAtCardClose || Strings.NA}
                      justify={true}
                    />
                  </div>
                )}
              </div>
            </>
          )}
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
              {hasAudios(evidences) && (
                <AudioPlayerPreviewGroup data={evidences} />
              )}
            </div>
          </>
        )}

        {!onOpenModal && (
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
        )}
      </div>
    </>
  );
};

export default InfoTagCard;
