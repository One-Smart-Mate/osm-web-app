import React, { useState } from "react";
import { Modal, Typography, Descriptions, Space, Divider, Card, Image, Button, Empty } from "antd";
import { FileTextOutlined, PictureOutlined, VideoCameraOutlined, FilePdfOutlined, FileOutlined } from "@ant-design/icons";
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
  const [currentVideoUrl] = useState("");

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
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image 
              src={detail.mediaUrl} 
              alt="Image" 
              style={{ 
                width: '400px', 
                height: '300px', 
                objectFit: 'contain',
                maxWidth: '100%' 
              }} 
              fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
            />
          </div>
          <Text style={{ marginTop: 8, display: 'block', fontWeight: 'bold', textAlign: 'center' }}>{getFileName(detail.mediaUrl)}</Text>
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
          <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <video 
              src={detail.mediaUrl} 
              controls 
              style={{ 
                width: '400px', 
                maxWidth: '100%', 
                height: '300px', 
                objectFit: 'contain' 
              }}
            />
            <Text style={{ marginTop: 8, display: 'block', fontWeight: 'bold', textAlign: 'center' }}>{getFileName(detail.mediaUrl)}</Text>
          </div>
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
