import {
  Modal,
  DatePicker,
  InputNumber,
  Button,
  Typography,
  Radio,
  Form,
  TimePicker,
  Row,
  Col,
  Checkbox,
  Alert,
} from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  ScheduleType,
  UpdateCiltSecuencesScheduleDTO,
} from "../../../data/cilt/ciltSecuencesSchedule/ciltSecuencesSchedule";
import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from "../../../services/cilt/ciltSecuencesScheduleService";
import Strings from "../../../utils/localizations/Strings";

const { Text } = Typography;

const DAYS_MAP = {
  D: "sun",
  L: "mon",
  M: "tue",
  X: "wed",
  J: "thu",
  V: "fri",
  S: "sat",
};

const DAYS_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

interface ScheduleSecuenceProps {
  open: boolean;
  onCancel: () => void;
  onSave: (data: any) => void;
  sequenceId?: number;
  ciltId?: number;
  siteId?: number;
  existingSchedule?: UpdateCiltSecuencesScheduleDTO;
}

export default function ScheduleSecuence({
  open,
  onCancel,
  onSave,
  sequenceId,
  ciltId,
  siteId,
  existingSchedule,
}: ScheduleSecuenceProps) {
  const [form] = Form.useForm();

  const [createSchedule, { isLoading: isCreating }] =
    useCreateScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] =
    useUpdateScheduleMutation();

  const [scheduleType, setScheduleType] = useState<ScheduleType>("dai");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (existingSchedule) {
        form.setFieldsValue({
          scheduleType: existingSchedule.scheduleType,
          schedule: existingSchedule.schedule
            ? dayjs(existingSchedule.schedule, "HH:mm:ss")
            : dayjs("08:00:00", "HH:mm:ss"),
          endDate: existingSchedule.endDate
            ? dayjs(existingSchedule.endDate)
            : null,
          sun: existingSchedule.sun === 1,
          mon: existingSchedule.mon === 1,
          tue: existingSchedule.tue === 1,
          wed: existingSchedule.wed === 1,
          thu: existingSchedule.thu === 1,
          fri: existingSchedule.fri === 1,
          sat: existingSchedule.sat === 1,
          dayOfMonth: existingSchedule.dayOfMonth || null,
          weekOfMonth: existingSchedule.weekOfMonth || null,
          dateOfYear: existingSchedule.dateOfYear
            ? dayjs(existingSchedule.dateOfYear)
            : null,
          monthOfYear: existingSchedule.monthOfYear || null,
          allowExecuteBefore: existingSchedule.allowExecuteBefore === 1,
          allowExecuteBeforeMinutes:
            existingSchedule.allowExecuteBeforeMinutes || 0,
          toleranceBeforeMinutes: existingSchedule.toleranceBeforeMinutes || 0,
          toleranceAfterMinutes: existingSchedule.toleranceAfterMinutes || 0,
          allowExecuteAfterDue: existingSchedule.allowExecuteAfterDue === 1,
        });
        setScheduleType(existingSchedule.scheduleType || "dai");
      } else {
        form.setFieldsValue({
          scheduleType: "dai",
          schedule: dayjs("08:00:00", "HH:mm:ss"),
          endDate: null,
          sun: false,
          mon: true,
          tue: true,
          wed: true,
          thu: true,
          fri: true,
          sat: false,
          dayOfMonth: null,
          weekOfMonth: null,
          dateOfYear: null,
          monthOfYear: null,
          allowExecuteBefore: true,
          allowExecuteBeforeMinutes: 15,
          toleranceBeforeMinutes: 5,
          toleranceAfterMinutes: 5,
          allowExecuteAfterDue: false,
        });
        setScheduleType("dai");
      }
    }
  }, [open, existingSchedule, form]);

  const handleScheduleTypeChange = (value: ScheduleType) => {
    setScheduleType(value);
    form.setFieldsValue({ scheduleType: value });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const dayValues = {
        sun: values.sun ? 1 : 0,
        mon: values.mon ? 1 : 0,
        tue: values.tue ? 1 : 0,
        wed: values.wed ? 1 : 0,
        thu: values.thu ? 1 : 0,
        fri: values.fri ? 1 : 0,
        sat: values.sat ? 1 : 0,
      };

      const scheduleData = {
        ...values,
        ...dayValues,
        siteId,
        ciltId,
        secuenceId: sequenceId,
        schedule: values.schedule ? values.schedule.format("HH:mm:ss") : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        dateOfYear: values.dateOfYear
          ? values.dateOfYear.format("YYYY-MM-DD")
          : null,
        allowExecuteBefore: values.allowExecuteBefore ? 1 : 0,
        allowExecuteAfterDue: values.allowExecuteAfterDue ? 1 : 0,
      };

      if (
        scheduleType === "wee" &&
        dayValues.sun === 0 &&
        dayValues.mon === 0 &&
        dayValues.tue === 0 &&
        dayValues.wed === 0 &&
        dayValues.thu === 0 &&
        dayValues.fri === 0 &&
        dayValues.sat === 0
      ) {
        setError(Strings.errorSelectDayOfWeek);
        return;
      }

      if (scheduleType === "mon" && !values.dayOfMonth && !values.weekOfMonth) {
        setError(Strings.errorSelectDayOfMonthOrWeekOfMonth);
        return;
      }

      if (scheduleType === "yea") {
        if (values.dateOfYear) {
          delete scheduleData.dayOfMonth;
          delete scheduleData.weekOfMonth;
          delete scheduleData.monthOfYear;
        } else if (
          values.monthOfYear &&
          (values.dayOfMonth ||
            (values.weekOfMonth &&
              (dayValues.sun === 1 ||
                dayValues.mon === 1 ||
                dayValues.tue === 1 ||
                dayValues.wed === 1 ||
                dayValues.thu === 1 ||
                dayValues.fri === 1 ||
                dayValues.sat === 1)))
        ) {
        } else {
          setError(Strings.errorSelectDateOfYear);
          return;
        }
      }

      if (existingSchedule?.id) {
        await updateSchedule({
          id: existingSchedule.id,
          ...scheduleData,
          updatedAt: new Date().toISOString(),
        }).unwrap();
        setSuccess(Strings. successScheduleUpdated);
      } else {
        await createSchedule({
          ...scheduleData,
          createdAt: new Date().toISOString(),
        }).unwrap();
        setSuccess(Strings.successScheduleCreated);
      }

      setError(null);

      setTimeout(() => {
        onSave(scheduleData);
      }, 1500);
    } catch (error) {
      console.error(Strings.errorSaveSchedule, error);
      setError(Strings.errorSaveSchedule);
    }
  };

  return (
    <Modal
      title={Strings.title}
      open={open}
      destroyOnHidden={true}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setScheduleType("dai");
        setError(null);
      }}
      width={700}
      footer={null}
    >
      <Form form={form} layout="vertical">
        {error && (
          <Alert message={error} type="error" style={{ marginBottom: 16 }} />
        )}
        {success && (
          <Alert
            message={success}
            type="success"
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label={Strings.labelSchedule}
          name="schedule"
          rules={[{ required: true, message: Strings.requiredSchedule }]} 
        >
          <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label={Strings.labelScheduleType}
          name="scheduleType"
          rules={[{ required: true }]}
        >
          <Radio.Group
            onChange={(e) => handleScheduleTypeChange(e.target.value)}
          >
            <Radio.Button value="dai">Diario</Radio.Button>
            <Radio.Button value="wee">Semanal</Radio.Button>
            <Radio.Button value="mon">Mensual</Radio.Button>
            <Radio.Button value="yea">Anual</Radio.Button>
            <Radio.Button value="man">Manual</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item label={Strings.labelEndDate} name="endDate">
          <DatePicker
            style={{ width: "100%" }}
            placeholder={Strings.placeholderEndDate}
          />
        </Form.Item>

        {/* Opciones específicas para cada tipo de programación */}
        {scheduleType === "wee" && (
          <Form.Item label={Strings.labelDaysOfWeek}>
            <Row gutter={[8, 8]}>
              {DAYS_LABELS.map((day) => (
                <Col key={day} span={3}>
                  <Form.Item
                    name={DAYS_MAP[day as keyof typeof DAYS_MAP]}
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox>{day}</Checkbox>
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form.Item>
        )}

        {scheduleType === "mon" && (
          <>
            <Form.Item label={Strings.labelDayOfMonth} name="dayOfMonth">
              <InputNumber min={1} max={31} style={{ width: "100%" }} />
            </Form.Item>

            <Text>{Strings.or}</Text>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={Strings.labelWeekOfMonth} name="weekOfMonth">
                  <InputNumber min={1} max={5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={Strings.labelDayOfWeek}>
                  <Row gutter={[8, 8]}>
                    {DAYS_LABELS.map((day) => (
                      <Col key={day} span={3}>
                        <Form.Item
                          name={DAYS_MAP[day as keyof typeof DAYS_MAP]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Checkbox>{day}</Checkbox>
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {scheduleType === "yea" && (
          <>
            <Form.Item label={Strings.labelDateOfYear} name="dateOfYear">
              <DatePicker
                style={{ width: "100%" }}
                placeholder={Strings.placeholderDateOfYear}
              />
            </Form.Item>

            <Text>{Strings.or}</Text>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={Strings.labelMonthOfYear} name="monthOfYear">
                  <InputNumber min={1} max={12} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={Strings.labelDayOfMonth} name="dayOfMonth">
                  <InputNumber min={1} max={31} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Text>{Strings.or}</Text>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={Strings.labelMonthOfYear} name="monthOfYear">
                  <InputNumber min={1} max={12} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={Strings.labelWeekOfMonth} name="weekOfMonth">
                  <InputNumber min={1} max={5} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item label={Strings.labelDayOfWeek}>
              <Row gutter={[8, 8]}>
                {DAYS_LABELS.map((day) => (
                  <Col key={day} span={3}>
                    <Form.Item
                      name={DAYS_MAP[day as keyof typeof DAYS_MAP]}
                      valuePropName="checked"
                      noStyle
                    >
                      <Checkbox>{day}</Checkbox>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Form.Item>
          </>
        )}

        {/* Opciones avanzadas */}
        <Form.Item label={Strings.labelExecutionConfiguration}>
          <Form.Item name="allowExecuteBefore" valuePropName="checked">
            <Checkbox>{Strings.allowExecuteBefore}</Checkbox>
          </Form.Item>

          <Form.Item
            name="allowExecuteBeforeMinutes"
            label={Strings.allowExecuteBeforeMinutes}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="toleranceBeforeMinutes"
            label={Strings.toleranceBeforeMinutes}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="toleranceAfterMinutes"
            label={Strings.toleranceAfterMinutes}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="allowExecuteAfterDue" valuePropName="checked">
            <Checkbox>{Strings.allowExecuteAfterDue}</Checkbox>
          </Form.Item>
        </Form.Item>

        {/* Botones de acción */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button onClick={onCancel}>{Strings.cancel}</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isCreating || isUpdating}
          >
            {existingSchedule ? Strings.update : Strings.save}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
