import React, { useEffect } from "react";
import { Modal, Typography, Tag, Descriptions, Card, Spin, Row, Col } from "antd";
import { useGetCardDetailsMutation } from "../../../services/cardService";
import { formatDate } from "../../../utils/Extensions";
import { 
  BsCalendar4, 
  BsPersonGear, 
  BsPinMap, 
  BsExclamationDiamond, 
  BsGear,
  BsInfoCircle,
  BsFileEarmarkText,
  BsShield
} from "react-icons/bs";
import Strings from "../../../utils/localizations/Strings";

const { Text, Paragraph } = Typography;

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

  // Format status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "A":
        return Strings.active;
      case "PS":
        return Strings.provisionalSolution;
      case "DS":
        return Strings.definitiveSolution;
      case "C":
        return Strings.closed;
      default:
        return status;
    }
  };



  return (
    <Modal
      title={
        <div className="flex items-center">
          <BsExclamationDiamond className="text-blue-500 mr-2" />
          {title}
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={1000}
      footer={null}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', paddingRight: 20 }}
      style={{ top: 20 }}
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
        <div className="px-4 overflow-visible">
          {/* Header with card type and status */}
          <div className="mb-5 flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: `#${cardData.card.cardTypeColor}` }} 
              />
              <Text strong className="text-lg">
                {cardData.card.cardTypeMethodologyName} - {cardData.card.cardTypeName}
              </Text>
            </div>
            <Tag color={getStatusColor(cardData.card.status)} className="text-sm px-3 py-1">
              {getStatusText(cardData.card.status)}
            </Tag>
          </div>
          
          {/* Basic Card Information */}
          <Card title={
            <div className="flex items-center">
              <BsInfoCircle className="text-blue-500 mr-2" />
              {Strings.cardInformation}
            </div>
          } className="mb-4">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div className="flex items-center mb-2">
                  <BsExclamationDiamond className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.cardId}: </Text>
                  <Text strong className="ml-2">{cardData.card.siteCardId}</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="flex items-center mb-2">
                  <BsCalendar4 className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.cardDueDate}: </Text>
                  <Text strong className="ml-2">{formatDate(cardData.card.cardDueDate)}</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="flex items-center mb-2">
                  <BsCalendar4 className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.creationDate}: </Text>
                  <Text strong className="ml-2">{formatDate(cardData.card.cardCreationDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex items-center mb-2">
                  <BsPinMap className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.cardLocation}: </Text>
                  <Text strong className="ml-2">{cardData.card.cardLocation}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex items-center mb-2">
                  <BsPersonGear className="text-blue-500 mr-2" />
                  <Text className="text-gray-500">{Strings.responsible}: </Text>
                  <Text strong className="ml-2">{cardData.card.responsableName}</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Technical Details */}
          <Card title={
            <div className="flex items-center">
              <BsGear className="text-blue-500 mr-2" />
              {Strings.cardTechnicalDetails}
            </div>
          } className="mb-4">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label={Strings.priority}>
                {cardData.card.priorityCode} - {cardData.card.priorityDescription}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.area}>
                {cardData.card.areaName}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.preclassifier}>
                {cardData.card.preclassifierCode} - {cardData.card.preclassifierDescription}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.mechanic}>
                {cardData.card.mechanicName || Strings.noMechanic}
              </Descriptions.Item>
                             <Descriptions.Item label={Strings.createdBy}>
                 {cardData.card.creatorName}
               </Descriptions.Item>
               <Descriptions.Item label={Strings.tagOrigin}>
                 {(cardData.card as any).tagOrigin || Strings.noDataAvailable}
               </Descriptions.Item>
               <Descriptions.Item label={Strings.cardUUID}>
                 <Text code>{cardData.card.cardUUID}</Text>
               </Descriptions.Item>
               <Descriptions.Item label={Strings.executionId}>
                 {(cardData.card as any).ciltSecuenceExecutionId || Strings.noDataAvailable}
               </Descriptions.Item>
               <Descriptions.Item label={Strings.route}>
                 {(cardData.card as any).route || Strings.noDataAvailable}
               </Descriptions.Item>
               <Descriptions.Item label={Strings.nodeName}>
                 {(cardData.card as any).nodeName} (ID: {(cardData.card as any).nodeId})
               </Descriptions.Item>
               {(cardData.card as any).feasibility && (
                 <Descriptions.Item label={Strings.feasibility}>
                   {(cardData.card as any).feasibility}
                 </Descriptions.Item>
               )}
               {(cardData.card as any).effect && (
                 <Descriptions.Item label={Strings.effect}>
                   {(cardData.card as any).effect}
                 </Descriptions.Item>
               )}
               {(cardData.card as any).appVersion && (
                 <Descriptions.Item label={Strings.appVersion}>
                   {(cardData.card as any).appVersion}
                 </Descriptions.Item>
               )}
               {(cardData.card as any).appSo && (
                 <Descriptions.Item label={Strings.appSo}>
                   {(cardData.card as any).appSo}
                 </Descriptions.Item>
               )}
            </Descriptions>
          </Card>

          {/* Comments */}
          <Card title={
            <div className="flex items-center">
              <BsFileEarmarkText className="text-blue-500 mr-2" />
              {Strings.comments}
            </div>
          } className="mb-4">
            <Paragraph className="whitespace-pre-wrap">
              {cardData.card.commentsAtCardCreation || Strings.noCommentsAvailable}
            </Paragraph>
          </Card>

          {/* Evidence Counters */}
          <Card title={
            <div className="flex items-center">
              <BsShield className="text-blue-500 mr-2" />
              {Strings.evidenceCounters}
            </div>
          } className="mb-4">
                         <Row gutter={[16, 8]}>
               <Col span={8}>
                 <Text strong>{Strings.evidenceAtCreation}:</Text>
                 <div className="ml-4">
                   <Text>Audio: {(cardData.card as any).evidenceAucr}</Text><br/>
                   <Text>Video: {(cardData.card as any).evidenceVicr}</Text><br/>
                   <Text>Imagen: {(cardData.card as any).evidenceImcr}</Text>
                 </div>
               </Col>
               <Col span={8}>
                 <Text strong>{Strings.evidenceAtProvisional}:</Text>
                 <div className="ml-4">
                   <Text>Audio: {(cardData.card as any).evidenceAups}</Text><br/>
                   <Text>Video: {(cardData.card as any).evidenceVips}</Text><br/>
                   <Text>Imagen: {(cardData.card as any).evidenceImps}</Text>
                 </div>
               </Col>
               <Col span={8}>
                 <Text strong>{Strings.evidenceAtDefinitive}:</Text>
                 <div className="ml-4">
                   <Text>Audio: {(cardData.card as any).evidenceAucl}</Text><br/>
                   <Text>Video: {(cardData.card as any).evidenceVicl}</Text><br/>
                   <Text>Imagen: {(cardData.card as any).evidenceImcl}</Text>
                 </div>
               </Col>
             </Row>
          </Card>

          {/* Provisional Solution */}
          {(cardData.card.status === "PS" || cardData.card.status === "DS" || cardData.card.status === "C") && (
            <Card title={Strings.provisionalSolution} className="mb-4">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={Strings.responsible}>
                  {cardData.card.userProvisionalSolutionName || 
                   cardData.card.userAppProvisionalSolutionName || 
                   Strings.noResponsible}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.date}>
                  {formatDate(cardData.card.cardProvisionalSolutionDate) || Strings.noDataAvailable}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.comments}>
                  {cardData.card.commentsAtCardProvisionalSolution || Strings.noCommentsAvailable}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Definitive Solution */}
          {(cardData.card.status === "DS" || cardData.card.status === "C") && (
            <Card title={Strings.definitiveSolution} className="mb-4">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={Strings.responsible}>
                  {cardData.card.userDefinitiveSolutionName || 
                   cardData.card.userAppDefinitiveSolutionName || 
                   Strings.noResponsible}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.date}>
                  {formatDate(cardData.card.cardDefinitiveSolutionDate) || Strings.noDataAvailable}
                </Descriptions.Item>
                <Descriptions.Item label={Strings.comments}>
                  {cardData.card.commentsAtCardDefinitiveSolution || Strings.noCommentsAvailable}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

                     {/* Manager Information */}
           {((cardData.card as any).managerName || (cardData.card as any).managerId) && (
             <Card title={
               <div className="flex items-center">
                 <BsPersonGear className="text-blue-500 mr-2" />
                 {Strings.managerInformation}
               </div>
             } className="mb-4">
               <Descriptions bordered column={1} size="small">
                 <Descriptions.Item label={Strings.manager}>
                   {(cardData.card as any).managerName || Strings.noDataAvailable}
                 </Descriptions.Item>
                 {(cardData.card as any).cardManagerCloseDate && (
                   <Descriptions.Item label={Strings.managerCloseDate}>
                     {formatDate((cardData.card as any).cardManagerCloseDate)}
                   </Descriptions.Item>
                 )}
                 {(cardData.card as any).commentsManagerAtCardClose && (
                   <Descriptions.Item label={Strings.commentsManagerAtCardClose}>
                     {(cardData.card as any).commentsManagerAtCardClose}
                   </Descriptions.Item>
                 )}
               </Descriptions>
             </Card>
           )}

          {/* Evidence List */}
          {cardData.evidences && cardData.evidences.length > 0 && (
            <Card title={
              <div className="flex items-center">
                <BsFileEarmarkText className="text-blue-500 mr-2" />
                {Strings.evidences} ({cardData.evidences.length})
              </div>
            } className="mb-4">
                             <div className="space-y-2">
                 {cardData.evidences.map((evidence: any) => (
                   <div key={evidence.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong>{evidence.evidenceName}</Text>
                        <Tag color="blue" className="ml-2">{evidence.evidenceType}</Tag>
                      </div>
                      <div className="text-right">
                        <div><Text className="text-gray-500 text-xs">{Strings.createdAt}: {formatDate(evidence.createdAt)}</Text></div>
                        <div><Text className="text-gray-500 text-xs">{Strings.updatedAt}: {formatDate(evidence.updatedAt)}</Text></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

                     {/* Discard Information */}
           {(cardData.card as any).amDiscardReasonId && (
             <Card title="Información de Descarte" className="mb-4">
               <Descriptions bordered column={1} size="small">
                 <Descriptions.Item label="Motivo de Descarte">
                   {(cardData.card as any).discardReason || Strings.noDataAvailable}
                 </Descriptions.Item>
               </Descriptions>
             </Card>
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
