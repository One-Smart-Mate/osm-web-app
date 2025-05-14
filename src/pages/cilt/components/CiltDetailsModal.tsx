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
  // Fix for image loading - ensure the URL is properly formed
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // If the URL is already absolute (starts with http or https), return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Otherwise, ensure it has a proper protocol
    return url.startsWith('/') ? `https:${url}` : `https://${url}`;
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
          <Descriptions.Item label={Strings.ciltMstrLastUpdated}>{cilt.updatedAt ? new Date(cilt.updatedAt).toLocaleString() : Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrLayoutLabel}>
            {cilt.urlImgLayout ? (
              <div>
                <Image
                  width={200}
                  src={getImageUrl(cilt.urlImgLayout)}
                  alt="Layout Preview"
                  fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
                />
                <div style={{ marginTop: '5px' }}>
                  <a href={getImageUrl(cilt.urlImgLayout)} target="_blank" rel="noopener noreferrer">
                    {Strings.ciltMstrViewFullImage}
                  </a>
                </div>
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
