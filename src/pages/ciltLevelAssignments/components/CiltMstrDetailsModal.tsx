import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Badge, Image, Row, Col, Typography, Table, Button, Space, notification } from "antd";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import { useGetCiltSequencesByCiltMutation } from "../../../services/cilt/ciltSequencesService";
import ScheduleSecuence from "../../cilt/components/ScheduleSecuence";
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
  const [getCiltSequencesByCilt] = useGetCiltSequencesByCiltMutation();
  const [sequences, setSequences] = useState<CiltSequence[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(null);
  const [scheduleSecuenceVisible, setScheduleSecuenceVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    if (ciltMstr && visible) {
      fetchSequences();
    }
  }, [ciltMstr, visible, refreshTrigger]);

  const fetchSequences = async () => {
    if (!ciltMstr) return;
    
    setLoading(true);
    try {
      const response = await getCiltSequencesByCilt(ciltMstr.id.toString()).unwrap();
      setSequences(response);
    } catch (error) {
      console.error("Error fetching CILT sequences:", error);
      notification.error({
        message: Strings.error,
        description: Strings.errorLoadingCiltOrSequences,
      });
    } finally {
      setLoading(false);
    }
  };

  const showScheduleSequence = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setScheduleSecuenceVisible(true);
  };

  const handleScheduleSequenceCancel = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequence(null);
  };

  const handleScheduleSequenceSuccess = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequence(null);
    setRefreshTrigger(prev => prev + 1);
    notification.success({
      message: Strings.success,
      description: Strings.successScheduleCreated,
    });
  };
  
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
      onCancel={(e) => {
        e?.stopPropagation();
        onCancel();
      }}
      maskClosable={false}
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

      {/* Sequences Section */}
      <Row gutter={[16, 16]} className="mt-4">
        <Col span={24}>
          <Typography.Title level={5}>{Strings.sequences}</Typography.Title>
          <Table
            dataSource={sequences}
            columns={[
              {
                title: Strings.color,
                dataIndex: "secuenceColor",
                key: "secuenceColor",
                render: (color) => (
                  <div
                    style={{
                      backgroundColor: color && color.startsWith("#") ? color : `#${color || "f0f0f0"}`,
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "1px solid #d9d9d9",
                    }}
                  />
                ),
                width: 60,
              },
              {
                title: "Sequence",
                dataIndex: "secuenceList",
                key: "secuenceList",
                render: (text) => text || "N/A",
              },
              {
                title: "Frequency",
                dataIndex: "frecuencyCode",
                key: "frecuencyCode",
                render: (text) => text || "N/A",
                width: 120,
              },
              {
                title: Strings.ciltType,
                dataIndex: "ciltTypeName",
                key: "ciltTypeName",
                render: (text) => text || "N/A",
                width: 120,
              },
              {
                title: Strings.actions,
                key: "actions",
                render: (_, record) => (
                  <Space size="small">
                    <Button type="default" size="small" onClick={() => showScheduleSequence(record)}>
                      {Strings.scheduleSequence}
                    </Button>
                  </Space>
                ),
                width: 150,
              },
            ]}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            loading={loading}
            size="small"
          />
        </Col>
      </Row>

      {/* Schedule Sequence Modal */}
      {selectedSequence && (
        <ScheduleSecuence
          open={scheduleSecuenceVisible}
          onCancel={handleScheduleSequenceCancel}
          onSave={handleScheduleSequenceSuccess}
          sequenceId={selectedSequence.id}
          ciltId={ciltMstr.id}
          siteId={ciltMstr.siteId || undefined}
        />
      )}
    </Modal>
  );
};

export default CiltMstrDetailsModal;
