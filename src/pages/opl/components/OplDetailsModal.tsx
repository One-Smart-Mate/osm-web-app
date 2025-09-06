import React, { useEffect, useState } from "react";
import { Modal, Tabs, Card, Typography, Space, Image, Button, Popconfirm, Tooltip, notification } from "antd";
import { FileTextOutlined, PictureOutlined, VideoCameraOutlined, FilePdfOutlined, PlusOutlined, EyeOutlined, FileOutlined, DeleteOutlined } from "@ant-design/icons";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import OplTextForm from "./OplTextForm";
import OplMediaUploader from "./OplMediaUploader";
import type { TabsProps } from "antd"; // Removed UploadFile as it's not used directly here
import { useDeleteOplDetailMutation } from "../../../services/cilt/oplDetailsService";
import Strings from "../../../utils/localizations/Strings";
import AnatomyNotification from "../../components/AnatomyNotification";

const { Text, Title, Paragraph } = Typography;

interface OplDetailsModalProps {
  open: boolean;
  currentOpl: OplMstr | null;
  currentDetails: OplDetail[];
  activeTab: string;
  fileList: any[]; // This seems to be for new files in OplMediaUploader
  uploadLoading: boolean;
  detailForm: any;
  onCancel: () => void;
  onTabChange: (key: string) => void;
  onFileChange: (info: any) => void;
  onPreview: (file: any) => void;
  onAddText: (values: any) => void;
  onAddMedia: (type: "imagen" | "video" | "pdf") => void;
  onDetailDeleted: (detailId: number) => void; 
}

const OplDetailsModal: React.FC<OplDetailsModalProps> = ({
  open,
  currentOpl,
  currentDetails,
  activeTab,
  fileList,
  uploadLoading,
  detailForm,
  onCancel,
  onTabChange,
  onFileChange,
  onPreview,
  onAddText,
  onAddMedia,
  onDetailDeleted,
}) => {
  // State for PDF preview modal
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  
  // State for video preview modal
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl, _setCurrentVideoUrl] = useState(""); // Prefixed setCurrentVideoUrl with _ as it's not used

  const [deleteOplDetail, { isLoading: isDeletingDetail }] = useDeleteOplDetailMutation();

  const handleDeleteExistingDetail = async (detailId: number) => {
    try {
      await deleteOplDetail(detailId).unwrap();
      notification.success({ message: Strings.notificationSuccessTitle, description: Strings.fileDeletedSuccessfully });
      onDetailDeleted?.(detailId);
    } catch (error) {
      AnatomyNotification.error(notification, {
        data: { message: Strings.errorDeletingFile }, // Assuming you'll add this string
        error,
      });
    }
  };

  // Effect to debug details when they change
  useEffect(() => {
    console.log("OplDetailsModal - currentDetails:", currentDetails);
  }, [currentDetails]);

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

  // Render an individual detail
  const renderDetailContent = (detail: OplDetail) => {
    // console.log("Rendering detail:", detail);
    
    if (detail.type === "texto") {
      return (
        <Card 
          style={{ 
            marginBottom: 16, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e8e8e8',
            borderRadius: '8px'
          }}
          title={<Space><FileTextOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplDetailsTextType}</Text></Space>}
          bordered={true}
        >
          <Paragraph style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{detail.text}</Paragraph>
          <Popconfirm
            title={Strings.removeTextConfirm}
            onConfirm={() => handleDeleteExistingDetail(detail.id)}
            okText={Strings.yes}
            cancelText={Strings.no}
            disabled={isDeletingDetail}
          >
            <Tooltip title={Strings.removeText}>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeletingDetail} 
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              />
            </Tooltip>
          </Popconfirm>
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
          title={<Space><PictureOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplDetailsImageType}</Text></Space>}
          bordered={true}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image 
              src={detail.mediaUrl} 
              alt={Strings.oplDetailsImageType} 
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
          <Popconfirm
            title={Strings.removeFileConfirm}
            onConfirm={() => handleDeleteExistingDetail(detail.id)}
            okText={Strings.yes}
            cancelText={Strings.no}
            disabled={isDeletingDetail}
          >
            <Tooltip title={Strings.removeFile}>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeletingDetail} 
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              />
            </Tooltip>
          </Popconfirm>
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
          title={<Space><VideoCameraOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplDetailsVideoType}</Text></Space>}
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
          <Popconfirm
            title={Strings.removeFileConfirm}
            onConfirm={() => handleDeleteExistingDetail(detail.id)}
            okText={Strings.yes}
            cancelText={Strings.no}
            disabled={isDeletingDetail}
          >
            <Tooltip title={Strings.removeFile}>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeletingDetail} 
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              />
            </Tooltip>
          </Popconfirm>
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
          title={<Space><FilePdfOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplDetailsPdfType}</Text></Space>}
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
              {Strings.oplDetailsViewPdf}
            </Button>
            <Text style={{ display: 'block', fontWeight: 'bold' }}>{getFileName(detail.mediaUrl)}</Text>
          </Space>
          <Popconfirm
            title={Strings.removeFileConfirm}
            onConfirm={() => handleDeleteExistingDetail(detail.id)}
            okText={Strings.yes}
            cancelText={Strings.no}
            disabled={isDeletingDetail}
          >
            <Tooltip title={Strings.removeFile}>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                loading={isDeletingDetail} 
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              />
            </Tooltip>
          </Popconfirm>
        </Card>
      );
    }
    return null;
  };

  // Preview of all details
  const DetailsPreview = () => {
    // console.log("Rendering DetailsPreview with", currentDetails.length, "details");
    
    return (
      <div style={{ padding: '0 16px' }}>
        <Title level={5} style={{ marginBottom: 24 }}>{Strings.oplDetailsContentPreview}</Title>
        {currentDetails.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Paragraph>{Strings.oplDetailsNoContent}</Paragraph>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => onTabChange("2")}
              >
                {Strings.oplDetailsAddContent}
              </Button>
            </div>
          </Card>
        ) : (
          <div>
            {currentDetails.map((detail) => (
              <div key={detail.id}>
                {renderDetailContent(detail)}
              </div>
            ))}
            {/* Botón de cerrar en la parte inferior */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Button type="default" onClick={onCancel}>
                {Strings.close}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Component to add text
  const AddTextTab = () => (
    <Card title={<Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddText}</Text>} bordered={false}>
      <OplTextForm 
        form={detailForm} 
        onSubmit={(values: any) => onAddText(values)} 
      />
    </Card>
  );

  // Component to add image
  const AddImageTab = () => (
    <Card title={<Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddImage}</Text>} bordered={false}>
      <OplMediaUploader
        fileList={fileList}
        fileType="imagen"
        uploadLoading={uploadLoading}
        onFileChange={onFileChange}
        onPreview={onPreview}
        onUpload={() => onAddMedia("imagen")}
        onCancel={onCancel}
      />
    </Card>
  );

  // Component to add video
  const AddVideoTab = () => (
    <Card title={<Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddVideo}</Text>} bordered={false}>
      <OplMediaUploader
        fileList={fileList}
        fileType="video"
        uploadLoading={uploadLoading}
        onFileChange={onFileChange}
        onPreview={onPreview}
        onUpload={() => onAddMedia("video")}
        onCancel={onCancel}
      />
    </Card>
  );

  // Component to add PDF
  const AddPdfTab = () => (
    <Card title={<Text strong style={{ color: '#000' }}>{Strings.oplDetailsAddPdf}</Text>} bordered={false}>
      <OplMediaUploader
        fileList={fileList}
        fileType="pdf"
        uploadLoading={uploadLoading}
        onFileChange={onFileChange}
        onPreview={onPreview}
        onUpload={() => onAddMedia("pdf")}
        onCancel={onCancel}
      />
    </Card>
  );

  // Configuration of the tabs for the details
  const detailTabs: TabsProps["items"] = [
    {
      key: "1",
      label: <Space><EyeOutlined style={{ color: '#1890ff' }} /> <Text strong>{Strings.oplDetailsViewTab}</Text></Space>,
      children: <DetailsPreview />
    },
    {
      key: "2",
      label: <Space><FileTextOutlined style={{ color: '#1890ff' }} /> <Text strong>{Strings.oplDetailsAddText}</Text></Space>,
      children: <AddTextTab />
    },
    {
      key: "3",
      label: <Space><PictureOutlined style={{ color: '#1890ff' }} /> <Text strong>{Strings.oplDetailsAddImage}</Text></Space>,
      children: <AddImageTab />
    },
    {
      key: "4",
      label: <Space><VideoCameraOutlined style={{ color: '#1890ff' }} /> <Text strong>{Strings.oplDetailsAddVideo}</Text></Space>,
      children: <AddVideoTab />
    },
    {
      key: "5",
      label: <Space><FilePdfOutlined style={{ color: '#1890ff' }} /> <Text strong>{Strings.oplDetailsAddPdf}</Text></Space>,
      children: <AddPdfTab />
    }
  ];

  return (
    <>
      <Modal
        title={`${Strings.oplDetailsModalTitle.replace('{title}', currentOpl?.title || '')}`}
        open={open}
        onCancel={onCancel}
        width={800}
        footer={null}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={onTabChange}
          items={detailTabs}
        />
      </Modal>
      
      {/* PDF Preview Modal */}
      <Modal
        title={Strings.oplDetailsPdfPreviewTitle}
        open={pdfPreviewVisible}
        onCancel={() => setPdfPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPdfPreviewVisible(false)}>
            {Strings.oplDetailsClose}
          </Button>,
          <Button 
            key="open" 
            type="primary" 
            onClick={() => window.open(currentPdfUrl)}
          >
            {Strings.oplDetailsOpenInNewTab}
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
        title={Strings.oplDetailsVideoPreviewTitle}
        open={videoPreviewVisible}
        onCancel={() => setVideoPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setVideoPreviewVisible(false)}>
            {Strings.oplDetailsClose}
          </Button>,
          <Button 
            key="open" 
            type="primary" 
            onClick={() => window.open(currentVideoUrl)}
          >
            {Strings.oplDetailsOpenInNewTab}
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

export default OplDetailsModal;
