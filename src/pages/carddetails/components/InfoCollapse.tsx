import { Collapse, Form } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  getDaysSince,
  hasAudios,
  hasImages,
  hasVideos,
} from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import CustomTag from "../../../components/CustomTag";
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
import EvidenceIndicator from "../../../components/EvidenceIndicator";
import ImagesCarousel from "./ImagesCarousel";
import VideosCarousel from "./VideosCarousel";
import AudiosList from "./AudiosList";

interface CardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
}

const InfoCollapse = ({ data, evidences }: CardProps) => {
  const [modalIsLoading, setModalLoading] = useState(false);
  const [modalIsOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(Strings.empty);
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateCardPriority] = useUpdateCardPriorityMutation();
  const [updateCardMechanic] = useUpdateCardMechanicMutation();
  const dispatch = useAppDispatch();

  const { card } = data;
  const cardStatus = getCardStatusAndText(card.status, card.cardDueDate, data.cardDefinitiveSolutionDate, card.cardCreationDate);

  const handleOnOpenModal = (modalType: string) => {
    setModalOpen(true);
    setModalType(modalType);
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
      return UpdateMechanicForm;
    }
  };

  const selecTitleByModalType = (modalType: string) => {
    if (modalType === Strings.priority) {
      return Strings.updatePriority;
    } else {
      return Strings.updateMechanic;
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
        await updateCardMechanic(
          new UpdateCardMechanic(
            Number(card.id),
            Number(values.mechanicId),
            Number(currentUser.userId)
          )
        ).unwrap();
      }
      setModalOpen(false);
      dispatch(setCardUpdatedIndicator());
      handleSucccessNotification(NotificationSuccess.UPDATE);
    } catch (error) {
      handleErrorNotification(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <Collapse
        defaultActiveKey={["1"]}
        className="bg-gray-100 rounded-xl shadow-md md:w-4/5"
      >
        <Collapse.Panel
          header={
            <>
              <div className="flex gap-3">
                <h2 className="text-base font-semibold text-black">
                  {Strings.creation}
                </h2>
                <p className="text-base text-gray-700">
                  {formatDate(card.createdAt) || Strings.NA}
                </p>
              </div>
            </>
          }
          key="1"
        >
          <div className="flex flex-col text-sm gap-3 flex-wrap">
            <div className="flex gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <p className="font-semibold"> {Strings.cardNumber} </p>{" "}
                <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                  {card.siteCardId || Strings.NA}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold"> {Strings.cardType} </p>{" "}
                <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                  {card.cardTypeName || Strings.NA}
                </p>
              </div>
              <div
                className="w-10 md:flex-1 rounded-lg border border-black"
                style={{ backgroundColor: `#${card.cardTypeColor}` }}
              />
            </div>
            <div className="flex gap-2">
              <p className="font-semibold"> {Strings.status} </p>{" "}
              <CustomTag color={cardStatus.status}>{cardStatus.text}</CustomTag>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <p className="font-semibold"> {Strings.creationDate} </p>{" "}
                <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                  {formatDate(card.createdAt) || Strings.NA}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold"> {Strings.daysSinceCreation} </p>{" "}
                <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                  {getDaysSince(card.createdAt) || Strings.NA}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold"> {Strings.dueDate} </p>{" "}
                <p className="bg-card-fields text-center rounded-lg py-1 px-1 text-white">
                  {card.cardDueDate || Strings.NA}
                </p>
              </div>
            </div>
            <div className="flex flex-col text-center gap-1">
              <p className="font-semibold">{Strings.problemType} </p>
              <p className="bg-card-fields rounded-lg py-1 px-1 text-white">
                {card.preclassifierCode
                  ? `${card.preclassifierCode} - ${card.preclassifierDescription}`
                  : Strings.NA}
              </p>
            </div>
            <div className="flex flex-col text-center gap-1">
              <p className="font-semibold">{Strings.priority} </p>
              <p
                onClick={() => handleOnOpenModal(Strings.priority)}
                className="bg-gray-500 rounded-lg py-1 px-1 text-white cursor-pointer hover:bg-gray-600"
              >
                {card.priorityCode
                  ? `${card.priorityCode} - ${card.priorityDescription}`
                  : Strings.NA}
              </p>
            </div>
            <div className="flex flex-col text-center gap-1">
              <p className="font-semibold">{Strings.location} </p>
              <p className="bg-card-fields rounded-lg py-1 px-1 text-white">
                {card.cardLocation || Strings.NA}
              </p>
            </div>
            <div className="flex flex-col text-center gap-1">
              <p className="font-semibold">{Strings.createdBy} </p>
              <p className="bg-card-fields rounded-lg py-1 px-1 text-white">
                {card.creatorName || Strings.NA}
              </p>
            </div>
          </div>
          <div className="flex flex-col text-center gap-1">
            <p className="font-semibold">{Strings.mechanic} </p>
            <p
              onClick={() => handleOnOpenModal(Strings.mechanic)}
              className="bg-gray-500 rounded-lg py-1 px-1 text-white cursor-pointer hover:bg-gray-600"
            >
              {card.mechanicName || "N/A"}
            </p>
          </div>
          <div className="flex flex-col text-center gap-1">
            <p className="font-semibold">{Strings.anomalyDetected} </p>
            <p className="bg-card-fields rounded-lg py-1 px-1 text-white">
              {card.commentsAtCardCreation || Strings.NA}
            </p>
          </div>
          <Collapse
            collapsible={evidences.length === 0 ? "disabled" : undefined}
            className="border-black mt-2 rounded-xl shadow-md"
          >
            <Collapse.Panel
              key="2"
              header={
                <>
                  <div className="flex gap-3">
                    <h2 className="text-base font-semibold text-black">
                      {Strings.evidences}
                    </h2>
                    {evidences.length === 0 && (
                      <p className="text-base text-gray-700">{Strings.NA}</p>
                    )}
                    {EvidenceIndicator(evidences)}
                  </div>
                </>
              }
            >
              <div className="flex justify-center gap-2 flex-wrap">
                {hasImages(evidences) && <ImagesCarousel data={evidences} />}
                {hasVideos(evidences) && <VideosCarousel data={evidences} />}
                {hasAudios(evidences) && <AudiosList data={evidences} />}
              </div>
            </Collapse.Panel>
          </Collapse>
        </Collapse.Panel>
      </Collapse>
      <Form.Provider
        onFormFinish={async (_, { values }) => {
          await handleOnFormUpdateFinish(values);
        }}
      >
        <ModalForm
          open={modalIsOpen}
          isLoading={modalIsLoading}
          onCancel={handleOnCancelButton}
          title={selecTitleByModalType(modalType)}
          FormComponent={selectFormByModalType(modalType)}
        />
      </Form.Provider>
    </>
  );
};

export default InfoCollapse;
