import React, { useState } from "react";
import { Modal, Spin, Card, Typography, Space, Button, Image } from "antd";
import {
  FileTextOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  PictureOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import Strings from "../../../utils/localizations/Strings";

interface OplDetailsModalProps {
  visible: boolean;
  opl: OplMstr | null;
  details: OplDetail[];
  loading: boolean;
  onCancel: () => void;
}

const { Text, Paragraph, Title } = Typography;

const OplDetailsModal: React.FC<OplDetailsModalProps> = ({
  visible,
  opl,
  details,
  loading,
  onCancel
}) => {
  
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  
  const handleOpenPdf = (url: string) => {
    setCurrentPdfUrl(url);
    setPdfPreviewVisible(true);
    
  };
  
  // Video ahora se reproduce directamente en la interfaz sin modal adicional
  const getFileName = (url: string | undefined): string => {
    if (!url) return "";

    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split("/");
      let fileName = parts[parts.length - 1];
      fileName = fileName.split("?")[0];
      return fileName;
    } catch (_e) {
      return url || "";
    }
  };

  const renderMediaContent = (detail: OplDetail) => {
    if (!detail.mediaUrl && !detail.text) return null;

    switch (detail.type) {
      case "imagen":
        return (
          <Card
            style={{
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
            }}
            title={
              <Space>
                <PictureOutlined style={{ color: "#1890ff", fontSize: "18px" }} />{" "}
                <Text strong>{Strings.oplSelectionModalImageTitle}</Text>
              </Space>
            }
            bordered={true}
          >
            {detail.mediaUrl ? (
              <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <Image
                  src={detail.mediaUrl}
                  alt={Strings.oplSelectionModalImageAlt}
                  style={{ 
                    width: "400px", 
                    height: "300px", 
                    objectFit: "contain",
                    maxWidth: "100%" 
                  }}
                  fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
                />
                <Text style={{ marginTop: 8, display: "block", fontWeight: "bold", textAlign: "center" }}>
                  {getFileName(detail.mediaUrl)}
                </Text>
              </div>
            ) : (
              <Text type="secondary">{Strings.oplSelectionModalNoContent}</Text>
            )}
          </Card>
        );
      case "video":
        return (
          <Card
            style={{
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
            }}
            title={
              <Space>
                <VideoCameraOutlined style={{ color: "#1890ff", fontSize: "18px" }} />{" "}
                <Text strong>Video</Text>
              </Space>
            }
            bordered={true}
          >
            {detail.mediaUrl ? (
              <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <video 
                  src={detail.mediaUrl} 
                  controls 
                  style={{ 
                    width: "400px", 
                    maxWidth: "100%", 
                    height: "300px", 
                    objectFit: "contain" 
                  }}
                  // Removed onPlay event to prevent opening in modal
                />
                <Text style={{ marginTop: 8, display: "block", fontWeight: "bold", textAlign: "center" }}>
                  {getFileName(detail.mediaUrl)}
                </Text>
              </div>
            ) : (
              <Text type="secondary">{Strings.oplSelectionModalNoContent}</Text>
            )}
          </Card>
        );
      case "pdf":
        return (
          <Card
            style={{
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
            }}
            title={
              <Space>
                <FilePdfOutlined style={{ color: "#1890ff", fontSize: "18px" }} />{" "}
                <Text strong>PDF</Text>
              </Space>
            }
            bordered={true}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button 
                type="primary" 
                icon={<FileOutlined />}
                onClick={() => detail.mediaUrl && handleOpenPdf(detail.mediaUrl)}
              >
                {Strings.oplViewPdf}
              </Button>
              <Text style={{ display: "block", fontWeight: "bold" }}>{detail.mediaUrl ? getFileName(detail.mediaUrl) : ""}</Text>
            </Space>
          </Card>
        );
      case "texto":
        return (
          <Card
            style={{
              marginBottom: "16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
            }}
            title={
              <Space>
                <FileTextOutlined style={{ color: "#1890ff", fontSize: "18px" }} />{" "}
                <Text strong>Texto</Text>
              </Space>
            }
            bordered={true}
          >
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{detail.text}</Paragraph>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        title={`${Strings.oplSelectionModalMultimediaTitle} - ${opl?.title || ""}`}
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        <Spin spinning={loading}>
          {details.length === 0 ? (
            <Text type="secondary">{Strings.oplSelectionModalNoContent}</Text>
          ) : (
            <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "0 16px" }}>
              <Title level={5} style={{ marginBottom: 24 }}>Contenido del OPL</Title>
              {details.map((detail) => (
                <div key={detail.id}>{renderMediaContent(detail)}</div>
              ))}
            </div>
          )}
        </Spin>
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
          </Button>
        ]}
      >
        <embed 
          src={currentPdfUrl} 
          style={{ width: '100%', height: '600px', border: 'none' }} 
          type="application/pdf"
        />
      </Modal>
    </>
  );
};

export default OplDetailsModal;
