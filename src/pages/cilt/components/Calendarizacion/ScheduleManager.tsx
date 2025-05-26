import React, { useState, useEffect } from "react";
import { Card, Button, Space, Modal, message, Spin, Alert } from "antd";
import dayjs from "dayjs";
import Strings from "../../../../utils/localizations/Strings";
import NewFeatureModal from "../NewFeatureModal";
import { useGetSchedulesBySequenceIdMutation } from "../../../../services/cilt/ciltSequencesScheduleServices";
import { CiltSecuencesSchedule } from "../../../../data/cilt/ciltSequencesSchedule/ciltSequencesSchedules";

const { confirm } = Modal;

interface Schedule {
  id: number;
  startDate: string;
  interval: number;
  startTime: string | null;
  scheduleType: string;
  frequency: string;
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

interface ScheduleManagerProps {
  visible: boolean;
  onCancel: () => void;
  existingSchedules?: Schedule[];
  onSave: (data: Omit<Schedule, "id">) => Promise<void>;
  onDelete: (id: number) => void;
  sequenceId: number;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  visible,
  onCancel,
  existingSchedules = [],
  onSave,
  onDelete,
  sequenceId,
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>(existingSchedules);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [getSchedulesBySequenceId] = useGetSchedulesBySequenceIdMutation();

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!sequenceId || !visible) return;
      
      setIsLoading(true);
      try {
        if (isNaN(sequenceId) || sequenceId <= 0) {
          throw new Error("Invalid sequence ID");
        }

        const response = await getSchedulesBySequenceId(sequenceId).unwrap();
        
        if (!Array.isArray(response)) {
          throw new Error("Invalid response format from server");
        }

        const mappedSchedules: Schedule[] = response
        .map((item: CiltSecuencesSchedule): Schedule | null => {
          if (!item) {
            console.warn("Empty schedule item received");
            return null;
          }
      
          const selectedDays = [
            item.mon ? "Lunes" : null,
            item.tue ? "Martes" : null,
            item.wed ? "Miércoles" : null,
            item.thu ? "Jueves" : null,
            item.fri ? "Viernes" : null,
            item.sat ? "Sábado" : null,
            item.sun ? "Domingo" : null,
          ].filter(Boolean) as string[];
      
          return {
            id: item.id,
            startDate: item.schedule ? dayjs(item.schedule).format("YYYY-MM-DD") : "",
            interval: item.frecuency ? parseInt(item.frecuency, 10) : 0,
            startTime: item.schedule ? dayjs(item.schedule).format("HH:mm:ss") : null,
            scheduleType: item.scheduleType || "",
            frequency: item.scheduleType || "",
            selectedDays,
            endDate: item.endDate ? dayjs(item.endDate).format("YYYY-MM-DD") : null,
          };
        })
        .filter((item): item is Schedule => item !== null); // Type guard to ensure no nulls
      
      setSchedules(mappedSchedules);

      
      } catch (error) {
        console.error("Error al obtener los horarios:", error);
  
        let errorMessage = "Hubo un error al obtener los horarios.";
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        message.error(errorMessage);
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [sequenceId, visible, getSchedulesBySequenceId]);

  const showModal = () => {
    setEditingSchedule(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    onCancel();
  };

  const handleSave = async (data: Omit<Schedule, "id">) => {
    try {
      await onSave(data);
      
      if (editingSchedule) {
        setSchedules(schedules.map(schedule =>
          schedule.id === editingSchedule.id ? { ...data, id: editingSchedule.id } : schedule
        ));
      } else {
        const newSchedule: Schedule = {
          ...data,
          id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1,
        };
        setSchedules([...schedules, newSchedule]);
      }
      
      setIsModalVisible(false);
      message.success("Horario guardado correctamente");
    } catch (error) {
      console.error("Error al guardar el horario:", error);
      message.error("Hubo un error al guardar el horario");
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    confirm({
      title: "Confirmación",
      content: "¿Confirmar la eliminación?",
      okText: Strings.yes,
      okType: "danger",
      cancelText: Strings.no,
      onOk() {
        setSchedules(schedules.filter(schedule => schedule.id !== id));
        onDelete(id);
        message.success("Horario eliminado correctamente");
      },
    });
  };

  const convertScheduleToDayjs = (schedule?: Schedule) => {
    if (!schedule) return undefined;
    return {
      ...schedule,
      startDate: dayjs(schedule.startDate),
      endDate: schedule.endDate ? dayjs(schedule.endDate) : null,
      startTime: schedule.startTime ? dayjs(schedule.startTime, "HH:mm:ss") : null,
    };
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          {Strings.close}
        </Button>,
      ]}
      width={800}
      destroyOnClose
      title="Gestión de programación"
      style={{ top: 20 }}
      zIndex={1001}
    >
      {!sequenceId ? (
        <Alert
          message="Error"
          description="No se ha seleccionado una secuencia válida"
          type="error"
          showIcon
        />
      ) : isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
            Nuevo horario
          </Button>

          <Space direction="vertical" style={{ width: "100%" }}>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <Card
                  key={schedule.id}
                  title={`Programación ${schedule.id}`}
                  extra={
                    <Space>
                      <Button onClick={() => handleEdit(schedule)}>{Strings.edit}</Button>
                      <Button danger onClick={() => handleDelete(schedule.id)}>
                        {Strings.delete}
                      </Button>
                    </Space>
                  }
                  style={{ width: "100%" }}
                >
                  <p><strong>Fecha de inicio:</strong> {dayjs(schedule.startDate).format("YYYY-MM-DD")}</p>
                  <p><strong>Intervalo:</strong> {schedule.interval}</p>
                  <p><strong>Tipo de horario:</strong> {schedule.scheduleType}</p>
                  <p><strong>Días seleccionados:</strong> {schedule.selectedDays?.join(", ") || "N/A"}</p>
                  <p><strong>Fecha de término:</strong> {schedule.endDate ? dayjs(schedule.endDate).format("YYYY-MM-DD") : "No tiene fecha de término"}</p>
                </Card>
              ))
            ) : (
              <Card>
                <p>No hay horarios programados</p>
              </Card>
            )}
          </Space>
        </>
      )}

      <NewFeatureModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        existingSchedule={editingSchedule ? convertScheduleToDayjs(editingSchedule) : undefined}
      />
    </Modal>
  );
};

export default ScheduleManager;