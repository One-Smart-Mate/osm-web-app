import React from 'react';
import { Modal, Button, Descriptions, Badge, Image } from 'antd';
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr';
import { getStatusAndText } from '../../../utils/Extensions';
import Strings from '../../../utils/localizations/Strings';

interface CiltDetailsModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
  onClone?: (cilt: CiltMstr) => void;
}

const CiltDetailsModal: React.FC<CiltDetailsModalProps> = ({
  visible,
  cilt,
  onCancel,
  onClone
}) => {
  
  const fallbackImageUrl = 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=';
  
  const getImageUrl = (url: string | undefined): string => {
    if (!url || url.trim() === '') return fallbackImageUrl;
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return url.startsWith('/') ? `https:${url}` : `https://${url}`;
  };
  
  const handleImageError = () => {
    const imgElements = document.querySelectorAll('.cilt-layout-image');
    imgElements.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.src = fallbackImageUrl;
      }
    });
  };

  return (
    <Modal
      title={Strings.ciltMstrDetailsModalTitle}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          {Strings.ciltMstrCloseButton}
        </Button>,
        onClone && cilt && (
          <Button key="clone" type="primary" onClick={() => onClone(cilt)}>
            {Strings.levelsTreeOptionClone}
          </Button>
        ),
      ]}
      width={600}
    >
      {cilt && (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={Strings.ciltMstrDetailsNameLabel}>{cilt.ciltName || Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrDetailsDescriptionLabel}>{cilt.ciltDescription || Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrCreatorLabel}>{cilt.creatorName || Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrReviewerLabel}>{cilt.reviewerName || Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrApproverLabel}>{cilt.approvedByName || Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrDetailsStandardTimeLabel}>{cilt.standardTime !== null ? cilt.standardTime : Strings.ciltMstrNA}</Descriptions.Item>
          {/* Campo learnigTime eliminado del flujo */}
          <Descriptions.Item label={Strings.ciltMstrOrderLabel}>{cilt.order !== null ? cilt.order : Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrDetailsStatusLabel}>
            {cilt.status ? (
              <Badge status={getStatusAndText(cilt.status).status} text={getStatusAndText(cilt.status).text} />
            ) : (
              Strings.ciltMstrNA
            )}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrLastUsedLabel}>{cilt.dateOfLastUsed ? new Date(cilt.dateOfLastUsed).toLocaleDateString() : Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltDueDate}>{cilt.ciltDueDate ? new Date(cilt.ciltDueDate).toLocaleDateString() : Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrLastUpdated}>{cilt.updatedAt ? new Date(cilt.updatedAt).toLocaleString() : Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrLayoutLabel}>
            {cilt.urlImgLayout ? (
              <div>
                <Image
                  width={200}
                  className="cilt-layout-image"
                  src={getImageUrl(cilt.urlImgLayout)}
                  alt="Layout Preview"
                  fallback={fallbackImageUrl}
                  onError={handleImageError}
                  preview={{
                    src: getImageUrl(cilt.urlImgLayout),
                    mask: Strings.ciltMstrViewFullImage,
                    maskClassName: 'custom-mask'
                  }}
                />
              </div>
            ) : (
              Strings.ciltMstrNotAvailable
            )}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default CiltDetailsModal;
