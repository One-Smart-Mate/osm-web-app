import { Form } from "antd";
import {
  formatDate,
  getCardStatusAndText,
  getDaysSince,
} from "../../../utils/Extensions";
import Strings from "../../../utils/localizations/Strings";
import { CardDetailsInterface } from "../../../data/card/card";
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
import { Divider, Typography } from "antd";

import { Row, Col } from "antd";


import { theme } from "antd";
import CustomTagV2 from "../../../components/CustomTagV2";


const { useToken } = theme;
const { Text } = Typography;


interface CardProps {
  data: CardDetailsInterface;
}

const PDFInfo = ({ data }: CardProps) => {
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


      <Divider orientation="left" style={{ borderColor: "#808080" }}>
        <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
          {Strings.tagDetails}
        </Text>
      </Divider>


      <div className="grid grid-rows-5 gap-y-6 gap-x-8 sm:grid-rows-none sm:gap-4 sm:px-4">

        <div className="mb-18">
          <Row gutter={15} className="mb-3">

            <Col span={8}>
              <div className="flex items-center gap-5">
                <span className="font-semibold text-xl md:text-xl">
                  {Strings.tagNumber}
                </span>
                <p className="text-xl md:text-xl">
                  {card.siteCardId || Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xl md:text-xl">
                  {Strings.cardType}
                </span>
                <p
                  className="font-semibold text-xl md:text-xl"
                  style={{ color: `#${card.cardTypeColor}` }}
                >
                  {card.cardTypeName}
                </p>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xl md:text-xl">
                  {Strings.status}
                </span>
                <CustomTagV2 className="w-min text-xl" color={cardStatus.status}>
                  <span className="font-medium">{cardStatus.text}</span>
                </CustomTagV2>
              </div>
            </Col>

          </Row>


          <Row gutter={15} className="mb-3">

            <Col span={8}>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-xl md:text-xl">
                  {Strings.creationDate}
                </span>
                <p className="text-left px-1 text-xl md:text-xl">
                  {formatDate(card.createdAt) || Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-xl md:text-xl">
                    {Strings.createdBy}
                  </p>
                  <p className="text-xl md:text-xl">
                    {card.creatorName || Strings.NA}
                  </p>
                </div>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xl md:text-xl">
                  {Strings.daysSinceCreation}
                </span>
                <p className="text-center font-semibold text-xl md:text-xl">
                  {getDaysSince(card.createdAt) || Strings.cero}
                </p>
              </div>
            </Col>


          </Row>



          <Row gutter={15} className="mb-3">

            <Col span={8}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xl md:text-xl">
                  {Strings.dueDate}
                </span>
                <p className="text-left px-1 text-xl md:text-xl">
                  {card.cardDueDate || Strings.NA}
                </p>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-xl md:text-xl">
                  {Strings.tagPriority}
                </p>
                <p
                  onClick={() => handleOnOpenModal(Strings.priority)}
                  className="text-xl md:text-xl"
                >
                  {card.priorityCode
                    ? `${card.priorityCode} - ${card.priorityDescription}`
                    : Strings.NA}
                </p>
              </div>
            </Col>


            <Col span={8}>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xl md:text-xl">
                  {Strings.dateStatus}
                </span>
                <span
                  className={`text-xl font-bold  ${cardStatus.dateStatus === Strings.expired
                    ? "text-red-500"
                    : "text-green-500"
                    }`}
                >
                  {cardStatus.dateStatus}
                </span>

              </div>
            </Col>

          </Row>

        </div>
        <Divider orientation="left" style={{ borderColor: "#808080" }}>
          <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
            {Strings.problemDetails}
          </Text>
        </Divider>


        <Row gutter={15} className="mb-3">
          <Col span={12}>
            <div className="flex flex-col">
              <span className="font-semibold text-xl md:text-xl">
                {Strings.problemType}
              </span>
              <p className="text-left px-1 text-xl md:text-xl">
                {card.preclassifierCode
                  ? `${card.preclassifierCode} - ${card.preclassifierDescription}`
                  : Strings.NA}
              </p>
            </div>
          </Col>

          <Col span={12}>
            <div className="flex flex-col">
              <span className="font-semibold text-xl md:text-xl">
                {Strings.location}
              </span>
              <p className="text-left px-1 text-xl md:text-xl">
                {card.cardLocation || Strings.NA}
              </p>
            </div>
          </Col>
        </Row>

        <Row gutter={15} className="mb-3">
          <Col span={12}>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-xl md:text-xl">
                {Strings.tagMechanic}
              </p>
              <p className="text-left px-1 text-xl md:text-xl">
                {card.mechanicName || Strings.NA}
              </p>
            </div>
          </Col>

          <Col span={12}>

            {/* Anomaly detected */}
            <div className="flex items-center gap-1">
              <p className="font-semibold text-xl md:text-xl">
                {Strings.anomalyDetected}
              </p>
              <p className="text-xl md:text-xl">
                {card.commentsAtCardCreation || Strings.NA}
              </p>
            </div>
          </Col>
        </Row>


      </div>

    </>
  );
};

export default PDFInfo;
