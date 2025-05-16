import { Modal, DatePicker, InputNumber, Select, Button, Typography, Space } from "antd";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useEffect } from "react";
import Strings from "../../../utils/localizations/Strings";

const { Text } = Typography;
const { Option } = Select;

const days = ["L", "M", "X", "J", "V", "S", "D"];

interface NewFeatureModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (data: {
    startDate: string;
    interval: number;
    frequency: string;
    selectedDays: string[];
    endDate: string | null;
  }) => void;
  onDelete?: () => void;
  existingSchedule?: {
    startDate: Dayjs;
    interval: number;
    frequency: string;
    selectedDays: string[];
    endDate: Dayjs | null;
  };
}


export default function NewFeatureModal({
  visible,
  onCancel,
  onSave,
  onDelete,
  existingSchedule,
}: NewFeatureModalProps) {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [interval, setInterval] = useState<number>(1);
  const [frequency, setFrequency] = useState<string>("semana");
  const [selectedDays, setSelectedDays] = useState<string[]>(["L", "M", "X"]);
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs("2025-10-28"));

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  useEffect(() => {
    if (existingSchedule) {
      setStartDate(existingSchedule.startDate);
      setInterval(existingSchedule.interval);
      setFrequency(existingSchedule.frequency);
      setSelectedDays(existingSchedule.selectedDays);
      setEndDate(existingSchedule.endDate);
    } else {
      setStartDate(dayjs());
      setInterval(1);
      setFrequency(Strings.weekValue);
      setSelectedDays(["L", "M", "X"]);
      setEndDate(dayjs("2025-10-28"));
    }
  }, [existingSchedule, visible]);


  return (
    <Modal
      title={Strings.repeat}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Text strong>Iniciar</Text>
          <DatePicker value={startDate} onChange={(date) => setStartDate(date!)} style={{ width: "100%" }} />
        </div>

        <div>
          <Text strong>{Strings.repeatEach}</Text>
          <Space>
            <InputNumber min={1} value={interval} onChange={(value) => setInterval(value ?? 1)} />
            <Select value={frequency} onChange={setFrequency}>
              <Option value="día">{Strings.dayValue}</Option>
              <Option value="semana">{Strings.weekValue}</Option>
              <Option value="mes">{Strings.monthValue}</Option>
              <Option value="año">{Strings.yearValue}</Option>
            </Select>
          </Space>
        </div>

        <div>
          <Space>
            {days.map((d) => (
              <Button
                key={d}
                type={selectedDays.includes(d) ? "primary" : "default"}
                onClick={() => toggleDay(d)}
              >
                {d}
              </Button>
            ))}
          </Space>
        </div>

        <Text>
          Tiene lugar cada {selectedDays.join(", ")} hasta{" "}
          <strong>{endDate?.format("D [de] MMM [de] YYYY")}</strong>
        </Text>

        <Space>
          <DatePicker value={endDate} onChange={(date) => setEndDate(date)} />
          <Button type="link" onClick={() => setEndDate(null)}>
            Quitar fecha de finalización
          </Button>
        </Space>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Button danger onClick={onDelete} disabled={!onDelete}>
            Eliminar
          </Button>

          <Button onClick={onCancel}>Descartar</Button>

          <Button
  type="primary"
  onClick={() =>
    onSave({
      
      startDate: startDate.toISOString(),
      interval,
      frequency,
      selectedDays,
      endDate: endDate ? endDate.toISOString() : null,
    })
  }
  disabled={!startDate || selectedDays.length === 0}
>
  Guardar
</Button>




        </div>
      </Space>
    </Modal>
  );
}  