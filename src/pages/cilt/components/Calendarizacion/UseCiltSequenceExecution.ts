// useCiltSequenceExecution.ts
import { useState } from "react";
import { message, Modal } from "antd";
import { useCreateScheduleMutation, useDeleteScheduleMutation, useGetSchedulesByCiltIdMutation, useUpdateScheduleMutation } from "../../../../services/cilt/ciltSequencesScheduleServices";
import { CiltSecuencesSchedule, CreateCiltSecuencesScheduleDto, UpdateCiltSecuencesScheduleDto } from "../../../../data/cilt/ciltSequencesSchedule/ciltSequencesSchedules";
import dayjs from "dayjs";


export const useCiltSequenceExecution = (currentCilt: any) => {
  const [scheduledData, setScheduledData] = useState<Record<number, any>>({});
  const [selectedSequence, setSelectedSequence] = useState<any>(null);

  const [getSchedulesByCiltId] = useGetSchedulesByCiltIdMutation();
  const [createSchedule] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const fetchExecutions = async () => {
    if (currentCilt?.id) {
      try {
        const response = await getSchedulesByCiltId(String(currentCilt.id));
        const fetchedExecutions = response.data;
        const mapped: Record<number, any> = {};

        if (fetchedExecutions) {
          fetchedExecutions.forEach((execution: CiltSecuencesSchedule) => {
            mapped[execution.id] = {
              ...execution,
              startDate: execution.schedule ? dayjs(execution.schedule).format("YYYY-MM-DD") : null,
              endDate: execution.endDate ? dayjs(execution.endDate).format("YYYY-MM-DD") : null,
              interval: execution.frecuency,
              frequency: execution.scheduleType,
              selectedDays: [
                execution.mon ? "Lunes" : null,
                execution.tue ? "Martes" : null,
                execution.wed ? "Miércoles" : null,
                execution.thu ? "Jueves" : null,
                execution.fri ? "Viernes" : null,
                execution.sat ? "Sábado" : null,
                execution.sun ? "Domingo" : null,
              ].filter(Boolean),
            };
          });
        }

        setScheduledData(mapped);
      } catch (error) {
        console.error("Error al obtener las programaciones:", error);
        message.error("Hubo un error al obtener las programaciones.");
      }
    }
  };

  const handleSave = async (schedule: {
    startDate: string;
    interval: number;
    frequency: string;
    selectedDays: string[];
    endDate: string | null;
    dayOfMonth?: number;
    weekOfMonth?: number;
    dateOfYear?: string;
    monthOfYear?: number;
    status?: string;
  }) => {
    const now = dayjs().toISOString();
    if (!selectedSequence) return;

    const ciltDetailsId = selectedSequence.id;
    const existingExecution = scheduledData[ciltDetailsId];

    // Mapea `schedule.frequency` a los valores esperados por el backend
  const mapFrequencyToScheduleType = (value: string): string => {
    switch (value) {
      case "día":
        return "dai"; // daily
      case "semana":
        return "wee"; // weekly
      case "mes":
        return "mon"; // monthly
      case "año":
        return "yea"; // yearly
      default:
        return "D1"; // fallback por seguridad, valor por defecto
    }
  };

    const basePayload: CreateCiltSecuencesScheduleDto = {
      siteId: Number(currentCilt.siteId),
      ciltId: currentCilt.id,
      secuenceId: Number(ciltDetailsId),
      frecuency: schedule.interval.toString(),
      schedule: schedule.startDate ? dayjs(schedule.startDate).format("HH:mm:ss") : undefined,
      scheduleType: mapFrequencyToScheduleType(schedule.frequency),
      endDate: schedule.endDate ? dayjs(schedule.endDate).format("YYYY-MM-DD") : undefined,
      mon: schedule.selectedDays.includes("Lunes") ? 1 : 0,
      tue: schedule.selectedDays.includes("Martes") ? 1 : 0,
      wed: schedule.selectedDays.includes("Miércoles") ? 1 : 0,
      thu: schedule.selectedDays.includes("Jueves") ? 1 : 0,
      fri: schedule.selectedDays.includes("Viernes") ? 1 : 0,
      sat: schedule.selectedDays.includes("Sábado") ? 1 : 0,
      sun: schedule.selectedDays.includes("Domingo") ? 1 : 0,
      dayOfMonth: schedule.dayOfMonth || undefined,
      weekOfMonth: schedule.weekOfMonth || undefined,
      dateOfYear: schedule.dateOfYear ? dayjs(schedule.dateOfYear).toISOString() : undefined,
      monthOfYear: schedule.monthOfYear || undefined,
      status: schedule.status || undefined,
      createdAt: now,
    };

    console.log("Payload enviado:", basePayload);

    try {
      if (existingExecution) {
        const updatePayload: UpdateCiltSecuencesScheduleDto = {
          id: Number(existingExecution.id),
          ...basePayload,
          updatedAt: now,
        };
        await updateSchedule(updatePayload).unwrap();
        message.success("Programación actualizada exitosamente.");
      } else {
        await createSchedule(basePayload).unwrap();
        message.success("Programación guardada exitosamente.");
      }

      await fetchExecutions();
    } catch (error) {
      console.error("Error al guardar/actualizar ejecución:", error);
      if (error instanceof Error) {
        console.error("Mensaje:", error.message);
        console.error("Stack:", error.stack);
      } else {
        console.error("Contenido del error:", JSON.stringify(error, null, 2));
      }
    }    
  };

  const handleDelete = (sequenceId: number) => {
    const schedule = scheduledData[sequenceId];
    if (!schedule?.id) return;

    Modal.confirm({
      title: "¿Estás seguro que deseas eliminar esta programación?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      async onOk() {
        try {
          await deleteSchedule(String(schedule.id)).unwrap();
          message.success("Programación eliminada exitosamente.");

          setScheduledData((prev) => {
            const newData = { ...prev };
            delete newData[sequenceId];
            return newData;
          });

          if (selectedSequence?.id === sequenceId) {
            setSelectedSequence(null);
          }
        } catch (error) {
          console.error("Error al eliminar la programación:", error);
          message.error("Hubo un error al eliminar la programación.");
        }
      },
    });
  };

  return {
    scheduledData,
    setScheduledData,
    selectedSequence,
    setSelectedSequence,
    fetchExecutions,
    handleSave,
    handleDelete,
  };
};
