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
} from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { CiltSequence } from "../../../data/cilt/ciltSequences/ciltSequences";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import NewFeatureModal from "./NewFeatureModal";
import { CreateCiltSequencesExecutionDTO } from "../../../data/cilt/ciltSequencesExecutions/ciltSequencesExecutions";
import dayjs from "dayjs";
import { useCreateCiltSequenceExecutionMutation, useGetCiltSequenceExecutionsByCiltMutation } from "../../../services/cilt/ciltSequencesExecutionsService";
import { message } from "antd";
import { useUpdateCiltSequenceExecutionMutation } from "../../../services/cilt/ciltSequencesExecutionsService";
import { useDeleteCiltSequenceExecutionMutation } from "../../../services/cilt/ciltSequencesExecutionsService";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetCiltSequenceFrequenciesByCiltMutation } from "../../../services/cilt/ciltSequencesFrequenciesService";





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
  // fetch all sequence-frequency associations for this CILT
  const [getSeqFreqs, { data: allSeqFreqs = [] }] = useGetCiltSequenceFrequenciesByCiltMutation();
  useEffect(() => { if (currentCilt?.id) getSeqFreqs(String(currentCilt.id)); }, [currentCilt?.id]);

  useEffect(() => {
    // Filter to only show active sequences
    const activeSequences = sequences.filter(sequence => sequence.status === Constants.STATUS_ACTIVE);
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

  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(null);

  const [getExecutions, { data: executionsFromBackend = [] }] = useGetCiltSequenceExecutionsByCiltMutation();

  


  useEffect(() => {
    if (currentCilt?.id) {
      getExecutions(String(currentCilt.id)).then((res) => {
        const fetchedExecutions = res.data;
        const mapped: Record<number, any> = {}; // Usa tipo apropiado si tienes DTO definido
  
        if (fetchedExecutions) {
          fetchedExecutions.forEach((execution: any) => {
            mapped[execution.ciltDetailsId] = {
              ...execution,
              startDate: execution.secuenceStart,
              endDate: execution.secuenceStop,
              interval: execution.duration,
              frequency: execution.standardOk,
              selectedDays: execution.initialParameter?.split(",") || [],
            };
          });
        }
  
        setScheduledData(mapped);
      });
    }
  }, [currentCilt?.id]);
  

  const handleSave = async (schedule: {
    startDate: string;
    interval: number;
    frequency: string;
    selectedDays: string[];
    endDate: string | null;
  }) => {
    const now = new Date().toISOString();
    if (!selectedSequence) return;
  
    const ciltDetailsId = selectedSequence.id;
    const existingExecution = scheduledData[ciltDetailsId];
  
    const basePayload = {
      siteId: Number(currentCilt.siteId),
      positionId: Number(currentCilt.positionId),
      ciltId: currentCilt.id,
      ciltDetailsId: Number(ciltDetailsId),
      secuenceStart: schedule.startDate,
      secuenceStop: schedule.endDate ?? undefined,
      duration: schedule.interval,
      standardOk: schedule.frequency,
      initialParameter: schedule.selectedDays.join(","),
      runSecuenceSchedule: schedule.startDate,
    };
  
    try {
      if (existingExecution) {
        const updatePayload = {
          id: Number(existingExecution.id), // Necesario para el update
          ...basePayload,
          updatedAt: now,
        };
        await updateExecution(updatePayload).unwrap();
        message.success("Programación actualizada exitosamente.");
      } else {
        const createPayload = {
          ...basePayload,
          createdAt: now,
        };
        await createExecution(createPayload).unwrap();
        message.success("Programación guardada exitosamente.");
      }

         // Refresh the data after saving
    if (currentCilt?.id) {
      const res = await getExecutions(String(currentCilt.id));
      const fetchedExecutions = res.data;
      const mapped: Record<number, any> = {};

      if (fetchedExecutions) {
        fetchedExecutions.forEach((execution: any) => {
          mapped[execution.ciltDetailsId] = {
            ...execution,
            startDate: execution.secuenceStart,
            endDate: execution.secuenceStop,
            interval: execution.duration,
            frequency: execution.standardOk,
            selectedDays: execution.initialParameter?.split(",") || [],
          };
        });
      }

      setScheduledData(mapped);
    }
      
    } catch (error) {
      console.error("Error al guardar/actualizar ejecución:", error);
      message.error("Hubo un error al guardar la programación.");
    }
  };
  

  const [updateExecution] = useUpdateCiltSequenceExecutionMutation();
  const [createExecution] = useCreateCiltSequenceExecutionMutation();
  const [deleteExecution] = useDeleteCiltSequenceExecutionMutation();

  const handleDelete = (sequenceId: number) => {
    const schedule = scheduledData[sequenceId];
    if (!schedule?.id) return;
  
    Modal.confirm({
      title: "¿Estás seguro que deseas eliminar esta programación?",
      icon: <ExclamationCircleOutlined />,
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      async onOk() {
        try {
          await deleteExecution(schedule.id).unwrap();
          message.success("Programación eliminada exitosamente.");
  
          setScheduledData((prev) => {
            const newData = { ...prev };
            delete newData[sequenceId];
            return newData;
          });
  
          if (isNewFeatureModalVisible && selectedSequence?.id === sequenceId) {
            setNewFeatureModalVisible(false);
            setSelectedSequence(null);
          }
  
        } catch (error) {
          console.error("Error al eliminar la programación:", error);
          message.error("Hubo un error al eliminar la programación.");
        }
      },
    });
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
                            <Text type="secondary">{Strings.schedule}:</Text>{" "}
                            <Text>
                              {Strings.each} {schedule.interval} {schedule.frequency}(s)
                              {Strings.theDays} {schedule.selectedDays.join(", ")} {Strings.since}{" "}
                              {schedule.startDate
                                ? dayjs(schedule.startDate).format("DD/MM/YYYY")
                                : ""}
                              {schedule.endDate
                                ? ` ${Strings.until} ${dayjs(schedule.endDate).format(
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
                              console.log("Selected Sequence ID:", sequence.id);
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

    const existing = scheduledData[selectedSequence.id];

    setScheduledData((prev) => ({
      ...prev,
      [selectedSequence.id]: {
        ...data,
        id: existing?.id, // Esto es necesario para update
      },
    }));

    await handleSave(data);
    setNewFeatureModalVisible(false);
  }}
  onDelete={() => {
    if (selectedSequence) {
      handleDelete(selectedSequence.id);
    }
  }}
/>


    </>
  );
};

export default SequencesModal;
