import { Modal, DatePicker, InputNumber, Select, Button, Typography, Space, Radio, TimePicker } from "antd";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import Strings from "../../../utils/localizations/Strings";


const { Text } = Typography;
const { Option } = Select;

const days = ["L", "M", "X", "J", "V", "S", "D"];
const weekdays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const weeks = ["Primer", "Segundo", "Tercer", "Cuarto", "Último"];

interface Schedule {
  id: number;
  startDate: string;
  interval: number;
  startTime: string | null;
  scheduleType: string;
  frequency: string; // Asegúrate de incluir esta propiedad
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


interface NewFeatureModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (data: Omit<Schedule, "id">) => void;
  onDelete?: () => void;
  existingSchedule?: {
    startDate: Dayjs;
    interval: number;
    scheduleType: string;
    selectedDays: string[];
    endDate: Dayjs | null;
    startTime: Dayjs | null;
    monthlyOptionType?: string;
    monthlyDay?: number;
    monthlyWeek?: string;
    monthlyWeekday?: string;
    yearlyOptionType?: string;
    yearlyDay?: number;
    yearlyMonth?: number;
    yearlyWeek?: string;
    yearlyWeekday?: string;
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
  const [frequency, setFrequency] = useState<string>(Strings.weekValue);
  
  const [selectedDays, setSelectedDays] = useState<string[]>(["L", "M", "X"]);
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs("2025-10-28"));
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());

  const [monthlyOptionType, setMonthlyOptionType] = useState("day");
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const [monthlyWeek, setMonthlyWeek] = useState("Primer");
  const [monthlyWeekday, setMonthlyWeekday] = useState("Lunes");

  const [yearlyOptionType, setYearlyOptionType] = useState("day");
  const [yearlyDay, setYearlyDay] = useState<number>(1);
  const [yearlyMonth, setYearlyMonth] = useState<number>(1);
  const [yearlyWeek, setYearlyWeek] = useState("Primer");
  const [yearlyWeekday, setYearlyWeekday] = useState("Lunes");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };


  useEffect(() => {
    if (existingSchedule) {
      setStartDate(existingSchedule.startDate);
      setInterval(existingSchedule.interval);
          setFrequency(mapScheduleTypeToFrequency(existingSchedule.scheduleType));
      setSelectedDays(existingSchedule.selectedDays);
      setEndDate(existingSchedule.endDate);
      setStartTime(existingSchedule.startTime || dayjs());
      setMonthlyOptionType(existingSchedule.monthlyOptionType || "day");
      setMonthlyDay(existingSchedule.monthlyDay || 1);
      setMonthlyWeek(existingSchedule.monthlyWeek || "Primer");
      setMonthlyWeekday(existingSchedule.monthlyWeekday || "Lunes");
      setYearlyOptionType(existingSchedule.yearlyOptionType || "day");
      setYearlyDay(existingSchedule.yearlyDay || 1);
      setYearlyMonth(existingSchedule.yearlyMonth || 1);
      setYearlyWeek(existingSchedule.yearlyWeek || "Primer");
      setYearlyWeekday(existingSchedule.yearlyWeekday || "Lunes");
    }
  }, [existingSchedule, visible]);

  const renderExtraInputs = () => {
    if (frequency === "mes") {
      return (
        <>
          <Radio.Group
            onChange={(e) => setMonthlyOptionType(e.target.value)}
            value={monthlyOptionType}
          >
            <Radio value="day">Día específico</Radio>
            <Radio value="weekday">Día de la semana</Radio>
          </Radio.Group>
          {monthlyOptionType === "day" ? (
            <InputNumber
              min={1}
              max={31}
              value={monthlyDay}
              onChange={(value) => setMonthlyDay(value ?? 1)}
            />
          ) : (
            <Space>
              <Select value={monthlyWeek} onChange={setMonthlyWeek}>
                {weeks.map((week) => (
                  <Option key={week} value={week}>{week}</Option>
                ))}
              </Select>
              <Select value={monthlyWeekday} onChange={setMonthlyWeekday}>
                {weekdays.map((day) => (
                  <Option key={day} value={day}>{day}</Option>
                ))}
              </Select>
            </Space>
          )}
        </>
      );
    }

    if (frequency === "año") {
      return (
        <>
          <Radio.Group
            onChange={(e) => setYearlyOptionType(e.target.value)}
            value={yearlyOptionType}
          >
            <Radio value="day">Día y mes específicos</Radio>
            <Radio value="weekday">Día de la semana en la semana del mes</Radio>
          </Radio.Group>
          {yearlyOptionType === "day" ? (
            <Space>
              <InputNumber
                min={1}
                max={31}
                value={yearlyDay}
                onChange={(value) => setYearlyDay(value ?? 1)}
              />
              <Select value={yearlyMonth} onChange={setYearlyMonth}>
                {Array.from({ length: 12 }, (_, i) => (
                  <Option key={i + 1} value={i + 1}>{dayjs().month(i).format("MMMM")}</Option>
                ))}
              </Select>
            </Space>
          ) : (
            <Space>
              <Select value={yearlyWeek} onChange={setYearlyWeek}>
                {weeks.map((week) => (
                  <Option key={week} value={week}>{week}</Option>
                ))}
              </Select>
              <Select value={yearlyWeekday} onChange={setYearlyWeekday}>
                {weekdays.map((day) => (
                  <Option key={day} value={day}>{day}</Option>
                ))}
              </Select>
            </Space>
          )}
        </>
      );
    }

    if (frequency === "semana") {
      return (
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
      );
    }

    return null;
  };


  const mapFrequencyToScheduleType = (value: string): string => {
    switch (value) {
      case "día":
        return "dai";
      case "semana":
        return "wee";
      case "mes":
        return "man";
      case "año":
        return "yea";
      default:
        return "dai"; // fallback por seguridad
    }
  };

  const mapScheduleTypeToFrequency = (value: string): string => {
    switch (value) {
      case "dai": return "día";
      case "wee": return "semana";
      case "man": return "mes";
      case "yea": return "año";
      default: return "día"; // fallback por seguridad
    }
  };
  

  return (
    <Modal
      title={Strings.repeat}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Text strong>{Strings.start}</Text>
          <DatePicker value={startDate} onChange={(date) => setStartDate(date!)} style={{ width: "100%" }} />
        </div>

        <div>
          <Text strong>Hora de inicio</Text>

          <TimePicker
            value={startTime ?? null}
            onChange={(time) => setStartTime(time)}
            style={{ width: "100%" }}
          />

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

        {renderExtraInputs()}

        <Text>
          {Strings.eachPlace} {selectedDays.join(", ")} {Strings.until} {" "}
          <strong>{endDate?.format("D [de] MMM [de] YYYY")}</strong>
        </Text>

        <Space>
          <DatePicker value={endDate} onChange={(date) => setEndDate(date)} />
          <Button type="link" onClick={() => setEndDate(null)}>
            {Strings.quitDate}
          </Button>
        </Space>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Button danger onClick={onDelete} disabled={!onDelete}>
            {Strings.delete}
          </Button>

          <Button onClick={onCancel}>{Strings.cancel}</Button>

          <Button
            type="primary"
            onClick={() =>
              onSave({
                startDate: startDate.toISOString(),
                interval,
                scheduleType: mapFrequencyToScheduleType(frequency),
                frequency: frequency,
                selectedDays,
                endDate: endDate ? endDate.toISOString() : null,
                startTime: startTime ? startTime.toISOString() : null,
                monthlyOptionType,
                monthlyDay,
                monthlyWeek,
                monthlyWeekday,
                yearlyOptionType,
                yearlyDay,
                yearlyMonth,
                yearlyWeek,
                yearlyWeekday,
              })
            }
            disabled={!startDate || (frequency === "semana" && selectedDays.length === 0)}
          >
            Guardar
          </Button>

        </div>
      </Space>
    </Modal>
  );
}
