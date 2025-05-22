import React, { useState } from "react";
import {
  Modal,
  Button,
  Space,
  Spin,
  Card,
  Row,
  Col,
  Input,
  Typography,
} from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import NewFeatureModal from "./NewFeatureModal";
import { CreateCiltSequencesExecutionDTO } from "../../../data/cilt/ciltSequencesExecutions/ciltSequencesExecutions";
import dayjs from "dayjs";
import { useCreateCiltSequenceExecutionMutation } from "../../../services/cilt/ciltSequencesExecutionsService";
import { message } from "antd";

interface SequencesModalProps {
  visible: boolean;
  currentCilt: CiltMstr | null;
  sequences: CiltSequence[];
  loading: boolean;
  onCancel: () => void;
  onCreateSequence: (cilt: CiltMstr) => void;
  onViewDetails: (sequence: CiltSequence) => void;
  onViewOpl: (oplId: number | null) => void;
  onEditSequence: (sequence: CiltSequence) => void;
}

const { Text } = Typography;

const SequencesModal: React.FC<SequencesModalProps> = ({
  visible,
  currentCilt,
  sequences,
  loading,
  onCancel,
  onCreateSequence,
  onViewDetails,
  onViewOpl,
  onEditSequence,
}) => {
  if (!currentCilt) return null;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSequences, setFilteredSequences] =
    useState<CiltSequence[]>(sequences);

  React.useEffect(() => {
    const activeSequences = sequences.filter(
      (sequence) => sequence.status === Constants.STATUS_ACTIVE
    );
    setFilteredSequences(activeSequences);
  }, [sequences]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    const activeSequences = sequences.filter(
      (sequence) => sequence.status === Constants.STATUS_ACTIVE
    );

    if (!value.trim()) {
      setFilteredSequences(activeSequences);
    } else {
      const filtered = activeSequences.filter(
        (sequence) =>
          sequence.secuenceList?.toLowerCase().includes(value.toLowerCase()) ||
          sequence.order?.toString().includes(value) ||
          sequence.standardTime?.toString().includes(value) ||
          sequence.toolsRequired?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSequences(filtered);
    }
  };

  const [isNewFeatureModalVisible, setNewFeatureModalVisible] = useState(false);

  const [scheduledData, setScheduledData] = useState<Record<number, any>>({});

  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(
    null
  );

  const handleSave = async (schedule: {
    startDate: string;
    interval: number;
    frequency: string;
    selectedDays: string[];
    endDate: string | null;
  }) => {
    const now = new Date().toISOString();

    if (!selectedSequence) return;

    const payload: CreateCiltSequencesExecutionDTO = {
      siteId: Number(currentCilt.siteId),
      positionId: Number(currentCilt.positionId),
      ciltId: currentCilt.id,
      ciltDetailsId: Number(selectedSequence.id),
      secuenceStart: schedule.startDate,
      secuenceStop: schedule.endDate ?? undefined,
      duration: schedule.interval,
      standardOk: schedule.frequency,
      initialParameter: schedule.selectedDays.join(","),
      runSecuenceSchedule: schedule.startDate,
      createdAt: now,
    };

    try {
      await createExecution(payload).unwrap();
      message.success("Programación guardada exitosamente.");
    } catch (error) {
      console.error("Error al guardar ejecución:", error);
      message.error("Hubo un error al guardar la programación.");
    }
  };

  const [createExecution] = useCreateCiltSequenceExecutionMutation();

  return (
    <>
      <Modal
        title={`${Strings.sequences} ${currentCilt?.ciltName || "CILT"}`}
        open={visible}
        onCancel={onCancel}
        zIndex={900}
        footer={[
          <Button key="close" onClick={onCancel}>
            {Strings.close}
          </Button>,
          <Button
            key="create"
            type="primary"
            onClick={() => {
              onCancel();
              if (currentCilt) {
                onCreateSequence(currentCilt);
              }
            }}
            disabled={!currentCilt}
          >
            {Strings.createNewSequence}
          </Button>,
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={16}>
              <Input
                placeholder={Strings.searchByDescriptionOrderOrTime}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Text>
                Total: {filteredSequences.length} {Strings.sequences}
              </Text>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          {filteredSequences.length === 0 ? (
            sequences.length === 0 ? (
              <Text type="secondary">{Strings.noSequencesForCilt}</Text>
            ) : (
              <Text type="secondary">{Strings.noSequencesMatchSearch}</Text>
            )
          ) : (
            <div
              style={{ maxHeight: "60vh", overflowY: "auto", padding: "10px" }}
            >
              {filteredSequences.map((sequence) => {
                const schedule = scheduledData[sequence.id];

                return (
                  <Card
                    key={sequence.id}
                    style={{
                      marginBottom: 16,
                      borderLeft: `4px solid ${
                        sequence.secuenceColor &&
                        sequence.secuenceColor.startsWith("#")
                          ? sequence.secuenceColor
                          : `#${sequence.secuenceColor || "1890ff"}`
                      }`,
                    }}
                    hoverable
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={16}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              backgroundColor:
                                sequence.secuenceColor &&
                                sequence.secuenceColor.startsWith("#")
                                  ? sequence.secuenceColor
                                  : `#${sequence.secuenceColor || "f0f0f0"}`,
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              marginRight: "10px",
                              border: "1px solid #d9d9d9",
                            }}
                          />
                          <Text strong>
                            {Strings.sequence} {sequence.order}
                          </Text>
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">{Strings.standardTime}:</Text>{" "}
                          <Text>{sequence.standardTime || "N/A"}</Text>
                        </div>

                        {/* Frequencies */}
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">
                            {Strings.createCiltSequenceModalFrequenciesTitle}:
                          </Text>{" "}
                          <Text>{sequence.frecuencyCode || "N/A"}</Text>
                        </div>

                        {sequence.toolsRequired && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary">{Strings.tools}:</Text>{" "}
                            <Text>{sequence.toolsRequired}</Text>
                          </div>
                        )}

                        <div>
                          <Text type="secondary">{Strings.created}:</Text>{" "}
                          <Text>
                            {sequence.createdAt
                              ? new Date(
                                  sequence.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Text>
                        </div>

                        {schedule && (
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Programación:</Text>{" "}
                            <Text>
                              Cada {schedule.interval} {schedule.frequency}(s)
                              los {schedule.selectedDays.join(", ")} desde{" "}
                              {schedule.startDate
                                ? dayjs(schedule.startDate).format("DD/MM/YYYY")
                                : ""}
                              {schedule.endDate
                                ? ` hasta ${dayjs(schedule.endDate).format(
                                    "DD/MM/YYYY"
                                  )}`
                                : ""}
                            </Text>
                          </div>
                        )}
                      </Col>
                      <Col
                        span={8}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "flex-end",
                        }}
                      >
                        <Space direction="vertical">
                          <Button
                            type="primary"
                            onClick={() => onViewDetails(sequence)}
                          >
                            {Strings.viewDetails}
                          </Button>

                          <Button
                            type="default"
                            onClick={() => {
                              if (
                                sequence.referenceOplSopId &&
                                sequence.referenceOplSopId > 0
                              ) {
                                const oplId = String(
                                  sequence.referenceOplSopId
                                ).trim();
                                console.log("Viewing OPL with ID:", oplId);
                                onViewOpl(Number(oplId));
                              }
                            }}
                            disabled={
                              !sequence.referenceOplSopId ||
                              sequence.referenceOplSopId <= 0
                            }
                          >
                            {Strings.viewReferenceOpl}
                          </Button>

                          <Button
                            type="default"
                            onClick={() =>
                              onViewOpl(sequence.remediationOplSopId)
                            }
                            disabled={!sequence.remediationOplSopId}
                          >
                            {Strings.viewRemediationOpl}
                          </Button>

                          <Button
                            type="default"
                            onClick={() => {
                              setSelectedSequence(sequence);
                              setNewFeatureModalVisible(true);
                            }}
                          >
                            {Strings.scheduleSequence}
                          </Button>

                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => onEditSequence(sequence)}
                          >
                            {Strings.editSequence}
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </div>
          )}
        </Spin>
      </Modal>

      <NewFeatureModal
        visible={isNewFeatureModalVisible}
        onCancel={() => setNewFeatureModalVisible(false)}
        existingSchedule={
          selectedSequence && scheduledData[selectedSequence.id]
            ? {
                ...scheduledData[selectedSequence.id],
                startDate: dayjs(scheduledData[selectedSequence.id].startDate),
                endDate: scheduledData[selectedSequence.id].endDate
                  ? dayjs(scheduledData[selectedSequence.id].endDate)
                  : null,
              }
            : undefined
        }
        onSave={async (data) => {
          if (!selectedSequence) return;

          setScheduledData((prev) => ({
            ...prev,
            [selectedSequence.id]: data,
          }));

          await handleSave(data);
          setNewFeatureModalVisible(false);
        }}
      />
    </>
  );
};

export default SequencesModal;
