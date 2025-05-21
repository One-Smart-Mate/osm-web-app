import React from "react";
import { Modal, Descriptions, Badge, Image, Row, Col, Typography } from "antd";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import Strings from "../../../utils/localizations/Strings";

const { Text } = Typography;

interface CiltMstrDetailsModalProps {
  visible: boolean;
  ciltMstr: CiltMstr | null;
  onCancel: () => void;
}

const CiltMstrDetailsModal: React.FC<CiltMstrDetailsModalProps> = ({
  visible,
  ciltMstr,
  onCancel,
}) => {
  if (!ciltMstr) return null;

  // Helper function to properly format image URLs
  const getImageUrl = (url: string | null | undefined): string => {
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
      title={`${Strings.details}: ${ciltMstr.ciltName}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {ciltMstr.urlImgLayout && (
            <div className="text-center mb-4">
              <Text strong>{Strings.layoutImage || "Image"}</Text>
              <div className="mt-2">
                <Image
                  src={getImageUrl(ciltMstr.urlImgLayout)}
                  alt={ciltMstr.ciltName || "CILT Layout"}
                  style={{ maxHeight: "300px" }}
                  fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
                />
              </div>
            </div>
          )}
        </Col>
        <Col span={24}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={Strings.ciltMstrNameLabel}>
              {ciltMstr.ciltName}
            </Descriptions.Item>
            <Descriptions.Item label="ID">
              {ciltMstr.id}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.ciltMstrListDescriptionColumn}>
              {ciltMstr.ciltDescription || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.ciltMstrListCreatorColumn}>
              {ciltMstr.creatorName || "-"}
            </Descriptions.Item>
            {ciltMstr.reviewerName && (
              <Descriptions.Item label="Reviewer">
                {ciltMstr.reviewerName}
              </Descriptions.Item>
            )}
            {ciltMstr.approvedByName && (
              <Descriptions.Item label="Approved By">
                {ciltMstr.approvedByName}
              </Descriptions.Item>
            )}
            {ciltMstr.standardTime !== null && (
              <Descriptions.Item label="Standard Time">
                {ciltMstr.standardTime}
              </Descriptions.Item>
            )}
            {ciltMstr.dateOfLastUsed && (
              <Descriptions.Item label="Last Used">
                {new Date(ciltMstr.dateOfLastUsed).toLocaleDateString()}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={Strings.status}>
              <Badge
                status={ciltMstr.status === "A" ? "success" : "error"}
                text={
                  ciltMstr.status === "A"
                    ? Strings.ciltMstrListActiveFilter
                    : Strings.ciltMstrListSuspendedFilter
                }
              />
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Modal>
  );
};

export default CiltMstrDetailsModal;
