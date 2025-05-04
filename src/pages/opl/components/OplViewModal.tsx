import React, { useState } from "react";
import { Modal, Typography, Descriptions, Space, Divider, Card, Image, Button, Empty } from "antd";
import { FileTextOutlined, PictureOutlined, VideoCameraOutlined, FilePdfOutlined, PlayCircleOutlined, FileOutlined } from "@ant-design/icons";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import Strings from "../../../utils/localizations/Strings";

const { Title, Text, Paragraph } = Typography;

interface OplViewModalProps {
  visible: boolean;
  currentOpl: OplMstr | null;
  currentDetails: OplDetail[];
  onCancel: () => void;
}

const OplViewModal: React.FC<OplViewModalProps> = ({
  visible,
  currentOpl,
  currentDetails,
  onCancel,
}) => {
  // State for PDF preview modal
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  
  // State for video preview modal
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  // Helper function to extract filename from URL
  const getFileName = (url: string | undefined): string => {
    if (!url) return "";
    
    try {
      // Decode URL components
      const decodedUrl = decodeURIComponent(url);
      
      // Extract filename from URL
      const parts = decodedUrl.split('/');
      let fullName = parts[parts.length - 1];
      
      // Remove query parameters if any
      fullName = fullName.split('?')[0];
      
      // Remove any additional parameters after underscore
      if (fullName.includes('_')) {
        const nameParts = fullName.split('_');
        // If it's a UUID pattern after underscore, remove it
        if (nameParts.length > 1 && nameParts[1].match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)) {
          fullName = nameParts[0];
        }
      }
      
      // If the filename still has a path pattern like "images/opl/filename.ext", extract just the filename
      if (fullName.includes('/')) {
        const pathParts = fullName.split('/');
        fullName = pathParts[pathParts.length - 1];
      }
      
      // If filename still has encoded characters like %20, try to decode again
      if (fullName.includes('%')) {
        try {
          fullName = decodeURIComponent(fullName);
        } catch (e) {
          // If decoding fails, keep the current name
        }
      }
      
      return fullName;
    } catch (e) {
      // If any error occurs during processing, try a simpler approach
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('?')[0];
      
      // Return just the last part of the path
      return fileName;
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Render an individual detail
  const renderDetailContent = (detail: OplDetail) => {
    if (detail.type === "texto") {
      return (
        <Card 
          style={{ 
            marginBottom: 16, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e8e8e8',
            borderRadius: '8px'
          }}
          title={<Space><FileTextOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplTextType}</Text></Space>}
          bordered={true}
        >
          <Paragraph>{detail.text}</Paragraph>
        </Card>
      );
    } else if (detail.type === "imagen" && detail.mediaUrl) {
      return (
        <Card 
          style={{ 
            marginBottom: 16, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e8e8e8',
            borderRadius: '8px'
          }}
          title={<Space><PictureOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplImageType}</Text></Space>}
          bordered={true}
        >
          <Image 
            src={detail.mediaUrl} 
            alt="Image" 
            style={{ maxWidth: '100%' }} 
            fallback="data:image/png;base64,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"
          />
          <Text style={{ marginTop: 8, display: 'block', fontWeight: 'bold' }}>{getFileName(detail.mediaUrl)}</Text>
        </Card>
      );
    } else if (detail.type === "video" && detail.mediaUrl) {
      return (
        <Card 
          style={{ 
            marginBottom: 16, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e8e8e8',
            borderRadius: '8px'
          }}
          title={<Space><VideoCameraOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplVideoType}</Text></Space>}
          bordered={true}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              onClick={() => {
                setCurrentVideoUrl(detail.mediaUrl || "");
                setVideoPreviewVisible(true);
              }}
              icon={<PlayCircleOutlined />}
            >
              {Strings.oplPlayVideo}
            </Button>
            <Text style={{ display: 'block', fontWeight: 'bold' }}>{getFileName(detail.mediaUrl)}</Text>
          </Space>
        </Card>
      );
    } else if (detail.type === "pdf" && detail.mediaUrl) {
      return (
        <Card 
          style={{ 
            marginBottom: 16, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e8e8e8',
            borderRadius: '8px'
          }}
          title={<Space><FilePdfOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplPdfType}</Text></Space>}
          bordered={true}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              onClick={() => {
                setCurrentPdfUrl(detail.mediaUrl || "");
                setPdfPreviewVisible(true);
              }}
              icon={<FileOutlined />}
            >
              {Strings.oplViewPdf}
            </Button>
            <Text style={{ display: 'block', fontWeight: 'bold' }}>{getFileName(detail.mediaUrl)}</Text>
          </Space>
        </Card>
      );
    }
    return null;
  };

  return (
    <>
      <Modal
        title={<Title level={4}>{Strings.oplViewModalTitle}</Title>}
        open={visible}
        onCancel={onCancel}
        width={800}
        footer={[
          <Button key="close" onClick={onCancel}>
            {Strings.oplClose}
          </Button>
        ]}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label={Strings.oplTitle}>
            {currentOpl?.title || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.oplObjective}>
            {currentOpl?.objetive || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.oplCreatedBy}>
            {currentOpl?.creatorName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.oplReviewedBy}>
            {currentOpl?.reviewerName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.oplCreationDate}>
            {formatDate(currentOpl?.createdAt)}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">{Strings.oplContentPreview}</Divider>

        {currentDetails && currentDetails.length > 0 ? (
          <div>
            {currentDetails.map((detail) => (
              <div key={detail.id}>
                {renderDetailContent(detail)}
              </div>
            ))}
          </div>
        ) : (
          <Empty description={Strings.oplNoDetails} />
        )}
      </Modal>
      
      {/* PDF Preview Modal */}
      <Modal
        title={Strings.oplPdfPreviewTitle}
        open={pdfPreviewVisible}
        onCancel={() => setPdfPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPdfPreviewVisible(false)}>
            {Strings.oplClose}
          </Button>,
          <Button 
            key="open" 
            type="primary" 
            onClick={() => window.open(currentPdfUrl)}
          >
            {Strings.oplOpenInNewTab}
          </Button>
        ]}
      >
        <embed 
          src={currentPdfUrl} 
          style={{ width: '100%', height: '600px', border: 'none' }} 
          type="application/pdf"
        />
      </Modal>
      
      {/* Video Preview Modal */}
      <Modal
        title={Strings.oplVideoPreviewTitle}
        open={videoPreviewVisible}
        onCancel={() => setVideoPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setVideoPreviewVisible(false)}>
            {Strings.oplClose}
          </Button>,
          <Button 
            key="open" 
            type="primary" 
            onClick={() => window.open(currentVideoUrl)}
          >
            {Strings.oplOpenInNewTab}
          </Button>
        ]}
      >
        <video 
          src={currentVideoUrl} 
          controls 
          style={{ width: '100%', maxHeight: '600px' }}
        />
      </Modal>
    </>
  );
};

export default OplViewModal;
