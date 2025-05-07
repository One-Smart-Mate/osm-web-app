import React from "react";
import { Modal, Spin, Card, Typography, Space, Button } from "antd";
import {
  FileOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  PictureOutlined,
  PlayCircleOutlined,
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
  onOpenPdf: (url: string) => void;
  onOpenVideo: (url: string) => void;
}

const { Text, Paragraph } = Typography;

const OplDetailsModal: React.FC<OplDetailsModalProps> = ({
  visible,
  opl,
  details,
  loading,
  onCancel,
  onOpenPdf,
  onOpenVideo,
}) => {
  const getFileName = (url: string | undefined): string => {
    if (!url) return "";

    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split("/");
      let fileName = parts[parts.length - 1];
      fileName = fileName.split("?")[0];
      return fileName;
    } catch (e) {
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
              <div style={{ textAlign: "center" }}>
                <img
                  src={detail.mediaUrl}
                  alt={Strings.oplSelectionModalImageAlt}
                  style={{ maxWidth: "100%", maxHeight: "300px" }}
                />
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
            actions={[
              detail.mediaUrl ? (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => onOpenVideo(detail.mediaUrl || "")}
                >
                  Reproducir Video
                </Button>
              ) : null,
            ].filter(Boolean)}
          >
            {detail.mediaUrl ? (
              <Text>{getFileName(detail.mediaUrl)}</Text>
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
            actions={[
              detail.mediaUrl ? (
                <Button
                  type="primary"
                  icon={<FileOutlined />}
                  onClick={() => onOpenPdf(detail.mediaUrl || "")}
                >
                  Ver PDF
                </Button>
              ) : null,
            ].filter(Boolean)}
          >
            {detail.mediaUrl ? (
              <Text>{getFileName(detail.mediaUrl)}</Text>
            ) : (
              <Text type="secondary">{Strings.oplSelectionModalNoContent}</Text>
            )}
          </Card>
        );
      case "texto":
        return (
          <Card
            style={{
              marginBottom: "16px",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
            }}
            title={
              <Space>
                <FileOutlined style={{ color: "#1890ff", fontSize: "18px" }} />{" "}
                <Text strong>Texto</Text>
              </Space>
            }
            bordered={true}
          >
            <Paragraph>{detail.text}</Paragraph>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
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
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {details.map((detail) => (
              <div key={detail.id}>{renderMediaContent(detail)}</div>
            ))}
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default OplDetailsModal;
