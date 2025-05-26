import React, { useEffect, useState } from "react";
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
  message,
} from "antd";
import { SearchOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import Strings from "../../../utils/localizations/Strings";
import { useGetCiltSequenceFrequenciesByCiltMutation } from "../../../services/cilt/ciltSequencesFrequenciesService";
import { CiltSequenceFrequency } from "../../../data/cilt/ciltSequencesFrequencies/ciltSequencesFrequencies";
import Constants from "../../../utils/Constants";
import dayjs from "dayjs";
import { useCiltSequenceExecution } from "./Calendarizacion/UseCiltSequenceExecution";
import ScheduleManager from "./Calendarizacion/ScheduleManager";

interface Schedule {
  id: number;
  startDate: string;
  interval: number;
  startTime: string | null;
  scheduleType: string;
  selectedDays: string[];
  endDate: string | null;
  monthlyOptionType?: string;
  monthlyDay?: number;
  monthlyWeek?: string;
  monthlyWeekday?: string;
  yearlyOptionType?: string;
  yearlyDay?: number;
  yearlyMonth?: number;
  yearlyWeek?: string;
  yearlyWeekday?: string;
}

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
  const [filteredSequences, setFilteredSequences] = useState<CiltSequence[]>(sequences);
  const [getSeqFreqs, { data: allSeqFreqs = [] }] = useGetCiltSequenceFrequenciesByCiltMutation();
  const [isScheduleManagerVisible, setScheduleManagerVisible] = useState(false);

  const {
    scheduledData,
    setScheduledData,
    selectedSequence,
    setSelectedSequence,
    fetchExecutions,
    handleSave,
    handleDelete,
  } = useCiltSequenceExecution(currentCilt);

  useEffect(() => {
    if (currentCilt?.id) getSeqFreqs(String(currentCilt.id));
  }, [currentCilt?.id]);

  useEffect(() => {
    const activeSequences = sequences.filter(sequence => sequence.status === Constants.STATUS_ACTIVE);
    setFilteredSequences(activeSequences);
  }, [sequences]);

  useEffect(() => {
    fetchExecutions();
  }, [currentCilt?.id]);

  useEffect(() => {
    console.log("SequencesModal mounted or updated");
  }, []);

  useEffect(() => {
    console.log("Estado actual de isScheduleManagerVisible:", isScheduleManagerVisible);
  }, [isScheduleManagerVisible]);


  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const activeSequences = sequences.filter(sequence => sequence.status === Constants.STATUS_ACTIVE);

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
              <Text>Total: {filteredSequences.length} {Strings.sequences}</Text>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          {filteredSequences.length === 0 ? (
            sequences.length === 0 ? (
              <Text type="secondary">
                {Strings.noSequencesForCilt}
              </Text>
            ) : (
              <Text type="secondary">
                {Strings.noSequencesMatchSearch}
              </Text>
            )
          ) : (
            <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "10px" }}>
              {filteredSequences.map((sequence) => {
                const schedule = scheduledData[sequence.id];

                return (
                  <Card
                    key={sequence.id}
                    style={{
                      marginBottom: 16,
                      borderLeft: `4px solid ${sequence.secuenceColor &&
                        sequence.secuenceColor.startsWith("#")
                        ? sequence.secuenceColor
                        : `#${sequence.secuenceColor || "1890ff"}`
                        }`,
                    }}
                    hoverable
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={16}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                          <div
                            style={{
                              backgroundColor:
                                sequence.secuenceColor && sequence.secuenceColor.startsWith("#")
                                  ? sequence.secuenceColor
                                  : `#${sequence.secuenceColor || "f0f0f0"}`,
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              marginRight: "10px",
                              border: "1px solid #d9d9d9",
                            }}
                          />
                          <Text strong>{Strings.sequence} {sequence.order}</Text>
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">{Strings.standardTime}:</Text>{" "}
                          <Text>{sequence.standardTime || "N/A"}</Text>
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">{Strings.createCiltSequenceModalFrequenciesTitle}:</Text>{" "}
                          <Text>{allSeqFreqs.filter((f: CiltSequenceFrequency) => f.secuencyId === sequence.id).map(f => f.frecuencyCode).join(", ") || "N/A"}</Text>
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
                              ? new Date(sequence.createdAt).toLocaleDateString()
                              : "N/A"}
                          </Text>
                        </div>

                        {schedule && schedule.selectedDays && (
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Programación:</Text>{" "}
                            <Text>
                              Cada {schedule.interval} {schedule.frequency}(s) los {schedule.selectedDays.join(", ")}{" "}
                              desde {schedule.startDate ? dayjs(schedule.startDate).format("DD/MM/YYYY") : ""}
                              {schedule.endDate ? ` hasta ${dayjs(schedule.endDate).format("DD/MM/YYYY")}` : ""}
                            </Text>
                          </div>
                        )}


                      </Col>
                      <Col span={8} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
                        <Space direction="vertical">
                          <Button type="primary" onClick={() => onViewDetails(sequence)}>
                            {Strings.viewDetails}
                          </Button>

                          <Button type="default" onClick={() => onViewOpl(sequence.referenceOplSopId)} disabled={!sequence.referenceOplSopId}>
                            {Strings.viewReferenceOpl}
                          </Button>

                          <Button type="default" onClick={() => onViewOpl(sequence.remediationOplSopId)} disabled={!sequence.remediationOplSopId}>
                            {Strings.viewRemediationOpl}
                          </Button>

                          <Button
                            type="default"
                            onClick={() => {
                              if (!currentCilt) {
                                message.error("No hay CILT seleccionado");
                                return;
                              }
                              if (!sequence) {
                                message.error("No hay secuencia seleccionada");
                                return;
                              }
                              console.log("Abriendo ScheduleManager...");
                              setSelectedSequence(sequence);
                              setScheduleManagerVisible(true);
                              console.log("Estado actualizado:", {
                                isScheduleManagerVisible: true,
                                currentCilt: currentCilt.id,
                                sequenceId: sequence.id
                              });
                            }}
                            disabled={!currentCilt}
                          >
                            {Strings.scheduleSequence}
                          </Button>

                          <Button type="primary" icon={<EditOutlined />} onClick={() => onEditSequence(sequence)}>
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

      {console.log("isScheduleManagerVisible before rendering ScheduleManager:", isScheduleManagerVisible)}

      {isScheduleManagerVisible && (
  <ScheduleManager
    visible={isScheduleManagerVisible}
    onCancel={() => setScheduleManagerVisible(false)}
    sequenceId={selectedSequence?.id || 0}
    existingSchedules={selectedSequence ? [scheduledData[selectedSequence.id]].filter(Boolean) : []}
    onSave={async (data) => {
      if (!selectedSequence) return;
      await handleSave(data);
      setScheduleManagerVisible(false);
    }}
    onDelete={(id) => {
      if (selectedSequence) {
        handleDelete(selectedSequence.id);
      }
    }}
  />
)}
    </>
  );
};

export default SequencesModal;
