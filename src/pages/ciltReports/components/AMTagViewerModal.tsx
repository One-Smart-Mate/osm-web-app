import React, { useEffect } from "react";
import { Modal, Typography, Tag, Descriptions, Card, Spin, Row, Col } from "antd";
import { useGetCardDetailsMutation } from "../../../services/cardService";
import { formatDate } from "../../../utils/Extensions";
import { BsCalendar4, BsPersonGear, BsPinMap, BsExclamationDiamond } from "react-icons/bs";
import Strings from "../../../utils/localizations/Strings";

const { Text, Title, Paragraph } = Typography;

interface AMTagViewerModalProps {
  open: boolean;
  amTagId: string | number | null;
  onClose: () => void;
  title: string;
}

/**
 * Modal component to view AM Tag details
 */
const AMTagViewerModal: React.FC<AMTagViewerModalProps> = ({
  open,
  amTagId,
  onClose,
  title
}) => {
  // Card details mutation
  const [getCardDetails, { data: cardData, isLoading, error }] = useGetCardDetailsMutation();

  useEffect(() => {
    if (open && amTagId) {
      // Fetch card details when modal opens and amTagId is available
      getCardDetails(String(amTagId));
    }
  }, [open, amTagId, getCardDetails]);

  // Handle modal close
  const handleClose = () => {
    onClose();
  };

  // Format status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "A": // Active
        return "blue";
      case "PS": // Provisional Solution
        return "orange";
      case "DS": // Definitive Solution
        return "green";
      case "C": // Closed
        return "purple";
      default:
        return "default";
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      width={800}
      footer={null}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <Text type="danger">{Strings.errorOnLoadingData}</Text>
        </div>
      ) : cardData && cardData.card ? (
        <div className="px-4">
          {/* Header with card type and status */}
          <div className="mb-5 flex justify-between">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: `#${cardData.card.cardTypeColor}` }} 
              />
              <Text strong>{cardData.card.cardTypeMethodologyName} - {cardData.card.cardTypeName}</Text>
            </div>
            <Tag color={getStatusColor(cardData.card.status)}>
              {cardData.card.status === "A" ? Strings.active : 
               cardData.card.status === "PS" ? Strings.provisionalSolution :
               cardData.card.status === "DS" ? Strings.definitiveSolution :
               cardData.card.status === "C" ? "Cerrado" : 
               cardData.card.status}
            </Tag>
          </div>
          
          {/* Card ID and due date */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={12}>
              <Card size="small" className="h-full">
                <div className="flex items-center">
                  <BsExclamationDiamond className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.cardId}: </Text>
                  <Text strong className="ml-2">{cardData.card.siteCardId}</Text>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" className="h-full">
                <div className="flex items-center">
                  <BsCalendar4 className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.cardDueDate}: </Text>
                  <Text strong className="ml-2">{formatDate(cardData.card.cardDueDate)}</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Location and responsible */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={12}>
              <Card size="small" className="h-full">
                <div className="flex items-center">
                  <BsPinMap className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.cardLocation}: </Text>
                  <Text strong className="ml-2">{cardData.card.cardLocation}</Text>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" className="h-full">
                <div className="flex items-center">
                  <BsPersonGear className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.responsible}: </Text>
                  <Text strong className="ml-2">{cardData.card.responsableName}</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Descriptions with card details */}
          <Descriptions bordered column={1} className="mb-4">
            <Descriptions.Item label={Strings.priority}>
              {cardData.card.priorityCode} - {cardData.card.priorityDescription}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.area}>
              {cardData.card.areaName}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.preclassifier}>
              {cardData.card.preclassifierCode} - {cardData.card.preclassifierDescription}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.createdBy}>
              {cardData.card.creatorName} - {formatDate(cardData.card.cardCreationDate)}
            </Descriptions.Item>
          </Descriptions>

          {/* Comments */}
          <Card title={Strings.comments} className="mb-4">
            <Paragraph className="whitespace-pre-wrap">{cardData.card.commentsAtCardCreation || Strings.noDataAvailable}</Paragraph>
          </Card>

          {/* Provisional Solution */}
          {cardData.card.status === "PS" || cardData.card.status === "DS" || cardData.card.status === "C" ? (
            <Card title={Strings.provisionalSolution} className="mb-4">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={Strings.responsible}>
                  {cardData.card.userProvisionalSolutionName || cardData.card.userAppProvisionalSolutionName || Strings.oplFormNotAssigned}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.date}>
                  {formatDate(cardData.card.cardProvisionalSolutionDate) || Strings.oplFormNotAssigned}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.comments}>
                  {cardData.card.commentsAtCardProvisionalSolution || Strings.noDataAvailable}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ) : null}

          {/* Definitive Solution */}
          {cardData.card.status === "DS" || cardData.card.status === "C" ? (
            <Card title={Strings.definitiveSolution} className="mb-4">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={Strings.responsible}>
                  {cardData.card.userDefinitiveSolutionName || cardData.card.userAppDefinitiveSolutionName || Strings.oplFormNotAssigned}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.date}>
                  {formatDate(cardData.card.cardDefinitiveSolutionDate) || Strings.oplFormNotAssigned}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.comments}>
                  {cardData.card.commentsAtCardDefinitiveSolution || Strings.noDataAvailable}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ) : null}

          {/* Evidence indicators */}
          {cardData.evidences && cardData.evidences.length > 0 && (
            <div className="mb-4">
              <Title level={5}>{Strings.tagCardEvidenceTitle}</Title>
              <Text>{Strings.noDataAvailable}</Text>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Text>{Strings.noDataAvailable}</Text>
        </div>
      )}
    </Modal>
  );
};

export default AMTagViewerModal;
