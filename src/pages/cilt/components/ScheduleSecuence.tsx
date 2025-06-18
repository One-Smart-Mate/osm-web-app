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
  notification,
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import AnatomyNotification from "../../components/AnatomyNotification";
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

  useEffect(() => {
    if (open) {
      if (existingSchedule) {
        const initialSchedules = existingSchedule.schedules && Array.isArray(existingSchedule.schedules) && existingSchedule.schedules.length > 0
          ? existingSchedule.schedules.map(s => dayjs(s, "HH:mm:ss"))
          : [dayjs("08:00:00", "HH:mm:ss")];
        form.setFieldsValue({
          schedules: initialSchedules,
          scheduleType: existingSchedule.scheduleType,
          
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
          schedules: [dayjs("08:00:00", "HH:mm:ss")],
          scheduleType: "dai",
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

      const schedulesArray = Array.isArray(values.schedules) ? values.schedules.map((s: any) => s ? s.format("HH:mm:ss") : null).filter((s: any) => s !== null) : [];

      if (schedulesArray.length === 0) {
        AnatomyNotification.error(notification, {
          data: {
            message: Strings.errorNoSchedules
          }
        });
        return;
      }

      const scheduleData = {
        ...values,
        ...dayValues,
        siteId,
        ciltId,
        secuenceId: sequenceId,
        schedules: schedulesArray, // Use the new array of schedules
        order: existingSchedule?.order || 1, // Set default order or use existing
        
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
AnatomyNotification.error(notification, {
          data: {
            message: Strings.errorSelectDayOfWeek
          }
        });
        return;
      }

      if (scheduleType === "mon" && !values.dayOfMonth && !values.weekOfMonth) {
AnatomyNotification.error(notification, {
          data: {
            message: Strings.errorSelectDayOfMonthOrWeekOfMonth
          }
        });
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
AnatomyNotification.error(notification, {
            data: {
              message: Strings.errorSelectDateOfYear
            }
          });
          return;
        }
      }

      if (existingSchedule?.id) {
        await updateSchedule({
          id: existingSchedule.id,
          ...scheduleData,
          updatedAt: new Date().toISOString(),
        }).unwrap();
      } else {
        await createSchedule({
          ...scheduleData,
          createdAt: new Date().toISOString(),
        }).unwrap();
      }

      setTimeout(() => {
        onSave(scheduleData);
      }, 1500);
    } catch (error) {
      console.error(Strings.errorSaveSchedule, error);
AnatomyNotification.error(notification, {
          data: {
            message: Strings.errorSaveSchedule
          }
        });
    }
  };

  return (
    <Modal
      title={Strings.title}
      open={open}
      destroyOnClose={true}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setScheduleType("dai");
      }}
      width={700}
      footer={null}
    >
      <Form form={form} layout="vertical" initialValues={{ schedules: [undefined] }}>
        {/* Error and success messages are now shown via AnatomyNotification */}

        <Form.List name="schedules">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name]}
                    label={`${Strings.labelSchedule} ${key + 1}`}
                    rules={[{ required: true, message: Strings.requiredSchedule }]}
                  >
                    <TimePicker format="HH:mm:ss" style={{ width: '150px' }} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ fontSize: '16px', color: 'red' }} title={Strings.removeSchedule}/>
                  ) : null}
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {Strings.addSchedule}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>



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
