import { Form } from "antd";
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

import { Row, Col } from "antd";
import VideosDisplayV2 from "./VideoPlayerV2";
import ImagesDisplayV2 from "./ImagesDisplayV2";
import AudiosDisplayV2 from "./AudioPlayer";

import { theme } from "antd";

const { useToken } = theme;


interface CardProps {
  data: CardDetailsInterface;
  evidences: Evidences[];
}

const InfoCollapseV2 = ({ data, evidences }: CardProps) => {
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
      <div className="px-4">
        <div className="grid grid-rows-5 gap-y-4 gap-x-8 sm:grid-rows-none sm:gap-4 sm:px-4">
          <Row gutter={15}>
            <Col span={8}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.tagNumber}
                </span>
                <p className="text-sm md:text-base">
                  {card.siteCardId || Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.cardType}
                </span>
                <p
                  className="font-semibold text-sm md:text-base"
                  style={{ color: `#${card.cardTypeColor}` }}
                >
                  {card.cardTypeName}
                </p>
              </div>
            </Col>

            <Col span={3}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.status}
                </span>

                <span
                  className="font-semibold text-sm md:text-base rounded-lg py-1 px-2 text-white cursor-pointer hover:bg-gray-600"
                  style={{ backgroundColor: primaryColor }}
                >
                  {" "}
                  {cardStatus.text}{" "}
                </span>
              </div>
            </Col>

            <Col span={5}>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm md:text-base">
                  {Strings.tagPriority}
                </p>
                <p
                  onClick={() => handleOnOpenModal(Strings.priority)}
                  className="font-semibold text-sm md:text-base rounded-lg py-1 px-2 text-white cursor-pointer hover:bg-gray-600"
                  style={{ backgroundColor: primaryColor }}
                >
                  {card.priorityCode
                    ? `${card.priorityCode} - ${card.priorityDescription}`
                    : Strings.NA}
                </p>
              </div>
            </Col>
          </Row>

          <Row gutter={15}>
            <Col span={8}>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.creationDate}
                </span>
                <p className="text-left px-1 text-sm md:text-base">
                  {formatDate(card.createdAt) || Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex flex-col">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.dueDate}
                </span>
                <p className="text-left px-1 text-sm md:text-base">
                  {card.cardDueDate || Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={3}>
              <div className="flex flex-col">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.dateStatus}
                </span>
                <p
                  className={`text-white text-center font-bold px-2 py-1 rounded-md ${cardStatus.dateStatus === Strings.expired
                    ? "bg-red-500"
                    : "bg-green-500"
                    }`}
                >
                  {cardStatus.dateStatus}
                </p>
              </div>
            </Col>

            <Col span={5}>
              <div className="flex flex-col">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.daysSinceCreation}
                </span>
                <p className="text-center font-semibold text-sm md:text-base">
                  {getDaysSince(card.createdAt) || Strings.cero}
                </p>
              </div>
            </Col>
          </Row>

          <Row gutter={15}>
            <Col span={8}>
              <div className="flex flex-col">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.problemType}
                </span>
                <p className="text-left px-1 text-sm md:text-base">
                  {card.preclassifierCode
                    ? `${card.preclassifierCode} - ${card.preclassifierDescription}`
                    : Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={16}>
              <div className="flex flex-col">
                <span className="font-semibold text-sm md:text-base">
                  {Strings.location}
                </span>
                <p className="text-left px-1 text-sm md:text-base">
                  {card.cardLocation || Strings.NA}
                </p>
              </div>
            </Col>
          </Row>

          <Row gutter={15}>
            <Col span={8}>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm md:text-base">
                  {Strings.tagMechanic}
                </p>
                <p
                  onClick={() => handleOnOpenModal(Strings.mechanic)}
                  className="text-left px-1 text-sm md:text-base"
                >
                  {card.mechanicName || Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={16}>

              {/* AAnomaly detected */}
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm md:text-base">
                  {Strings.anomalyDetected}
                </p>
                <p className="text-sm md:text-base">
                  {card.commentsAtCardCreation || Strings.NA}
                </p>
              </div>
            </Col>
          </Row>

          {/* Created by */}
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm md:text-base">
                {Strings.createdBy}
              </p>
              <p className="text-sm md:text-base">
                {card.creatorName || Strings.NA}
              </p>
            </div>
          </div>
        </div>

        <Divider
          orientation="left"
          style={{ borderColor: "	#808080" }}
          className="text-sm md:text-base"
        >
          {Strings.evidencesAtCreationDivider}
        </Divider>

        <div className="flex gap-3">
          {evidences.length === 0 && (
            <p className="text-base text-gray-700">{Strings.NA}</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mt-2 justify-center items-center">
          {hasImages(evidences) && <ImagesDisplayV2 data={evidences} />}
        </div>

        <div className="flex gap-2 flex-wrap mt-2 justify-center items-center">
          {hasVideos(evidences) && <VideosDisplayV2 data={evidences} />}
        </div>

        <div className="flex gap-2 flex-wrap mt-2 justify-center items-center">
          {hasAudios(evidences) && <AudiosDisplayV2 data={evidences} />}
        </div>
      </div>

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

export default InfoCollapseV2;
