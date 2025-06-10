import React from "react";
import { Modal, Typography, Card, Image, Space } from "antd";
import { FileTextOutlined, PictureOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import Strings from "../../../utils/localizations/Strings";

const { Text, Title, Paragraph } = Typography;

// Extended OplMstr type to include details property
interface ExtendedOplMstr extends OplMstr {
  details?: OplDetail[];
}

interface OplViewerModalProps {
  open: boolean;
  oplData: ExtendedOplMstr | null;
  onClose: () => void;
  title: string;
}

const OplViewerModal: React.FC<OplViewerModalProps> = ({ open, oplData, onClose, title }) => {
  // Helper function to extract filename from URL
  const getFileName = (url: string | undefined): string => {
    if (!url) return "";
    
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      let fullName = parts[parts.length - 1];
      
      fullName = fullName.split('?')[0];
      
      if (fullName.includes('_')) {
        const nameParts = fullName.split('_');
        if (nameParts.length > 1 && nameParts[1].match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)) {
          fullName = nameParts[0];
        }
      }
      
      if (fullName.includes('/')) {
        const pathParts = fullName.split('/');
        fullName = pathParts[pathParts.length - 1];
      }
      
      if (fullName.includes('%')) {
        try {
          fullName = decodeURIComponent(fullName);
        } catch (e) {
          // If decoding fails, keep the current name
        }
      }
      
      return fullName;
    } catch (e) {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('?')[0];
      return fileName;
    }
  };

  // Render the content of a detail
  const renderDetailContent = (detail: OplDetail) => {
    if (detail.type === "texto") {
      return (
        <Card 
          className="mb-4 shadow-md border border-gray-200 rounded-lg"
          title={<Space><FileTextOutlined className="text-blue-500 text-lg" /> <Text strong>{Strings.oplTextType}</Text></Space>}
          bordered={true}
        >
          <Paragraph className="whitespace-pre-wrap">{detail.text}</Paragraph>
        </Card>
      );
    } else if (detail.type === "imagen" && detail.mediaUrl) {
      return (
        <Card 
          className="mb-4 shadow-md border border-gray-200 rounded-lg"
          title={<Space><PictureOutlined className="text-blue-500 text-lg" /> <Text strong>{Strings.oplImageType}</Text></Space>}
          bordered={true}
        >
          <div className="flex justify-center">
            <Image 
              src={detail.mediaUrl} 
              alt="Imagen" 
              className="w-[400px] h-[300px] object-contain max-w-full" 
              fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
            />
          </div>
          <Text className="mt-2 block font-bold text-center">{getFileName(detail.mediaUrl)}</Text>
        </Card>
      );
    } else if (detail.type === "video" && detail.mediaUrl) {
      return (
        <Card 
          className="mb-4 shadow-md border border-gray-200 rounded-lg"
          title={<Space><VideoCameraOutlined className="text-blue-500 text-lg" /> <Text strong>{Strings.oplVideoType}</Text></Space>}
          bordered={true}
        >
          <div className="flex justify-center flex-col items-center">
            <video 
              src={detail.mediaUrl} 
              controls 
              className="w-[400px] max-w-full h-[300px] object-contain" 
            />
            <Text className="mt-2 block font-bold text-center">{getFileName(detail.mediaUrl)}</Text>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      {oplData ? (
        <div className="px-4">
          <div className="mb-6">
            <Title level={4} className="mb-2">{oplData.title}</Title>
            <Text className="block mb-4 text-gray-500">{Strings.objective}: {oplData.objetive}</Text>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded p-2">
                <Text className="text-gray-500">{Strings.oplCreatedBy}: </Text>
                <Text className="block font-medium">{oplData.creatorName}</Text>
              </div>
              <div className="border rounded p-2">
                <Text className="text-gray-500">{Strings.oplReviewedBy}: </Text>
                <Text className="block font-medium">{oplData.reviewerName}</Text>
              </div>
            </div>
          </div>

          <Title level={5} className="mb-4">{Strings.oplDetailsListContentColumn}</Title>
          {oplData.details && oplData.details.length > 0 ? (
            <div>
              {oplData.details.map((detail) => (
                <div key={detail.id}>
                  {renderDetailContent(detail)}
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <Text>{Strings.oplNoDetails}</Text>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Text>{Strings.oplNoDetails}</Text>
        </div>
      )}
    </Modal>
  );
};

export default OplViewerModal;
