import React from 'react';
import { Modal, Button, Descriptions, Badge, Image } from 'antd';
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr';
import { getStatusAndText } from '../../../utils/Extensions';
import Strings from '../../../utils/localizations/Strings';

interface CiltDetailsModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
}

const CiltDetailsModal: React.FC<CiltDetailsModalProps> = ({
  visible,
  cilt,
  onCancel
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
          <Descriptions.Item label={Strings.ciltMstrDetailsLearningTimeLabel}>{cilt.learnigTime || Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrOrderLabel}>{cilt.order !== null ? cilt.order : Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrDetailsStatusLabel}>
            {cilt.status ? (
              <Badge status={getStatusAndText(cilt.status).status} text={getStatusAndText(cilt.status).text} />
            ) : (
              Strings.ciltMstrNA
            )}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrLastUsedLabel}>{cilt.dateOfLastUsed ? new Date(cilt.dateOfLastUsed).toLocaleDateString() : Strings.ciltMstrNA}</Descriptions.Item>
          <Descriptions.Item label={Strings.ciltMstrLayoutLabel}>
            {cilt.urlImgLayout ? (
              <div>
                <Image
                  width={200}
                  src={getImageUrl(cilt.urlImgLayout)}
                  alt="Layout Preview"
                  fallback="data:image/png;base64,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"
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
