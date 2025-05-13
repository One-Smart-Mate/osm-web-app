import { Form, FormInstance, Input, InputNumber, Select } from "antd";
import React, { useEffect, useState } from "react";
import { Priority } from "../../../data/priority/priority";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { BsCalendar2Date, BsCardText, BsQrCode } from "react-icons/bs";
import { useGetStatusMutation } from "../../../services/statusService";
import { Status } from "../../../data/status/status";

interface PriorityFormCardProps {
  form: FormInstance;
  initialValues?: Priority;
  onSubmit: (values: any) => void;
  enableStatus: boolean;
}

const PriorityFormCard = ({
  form,
  onSubmit,
  enableStatus,
  initialValues,
}: PriorityFormCardProps): React.ReactElement => {
  const [getStatus, { isLoading }] = useGetStatusMutation();
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        code: initialValues.priorityCode,
        description: initialValues.priorityDescription,
        days: initialValues.priorityDays,
        status: initialValues.status,
        id: initialValues.id
      });
    }
    if (enableStatus) {
      handleGetStatus();
    }
  }, []);

  const handleGetStatus = async () => {
    const response = await getStatus().unwrap();
    setStatusOptions(response);
  };

  const formatStatusOptions = () => {
    return statusOptions.map((status) => ({
      value: status.statusCode,
      label: status.statusName,
    }));
  };

  return (
    <Form form={form} onFinish={onSubmit}>
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>

          <Form.Item
            name="code"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredCode },
              { max: 4 },
            ]}
            className="mr-1"
          >
            <Input
              size="large"
              maxLength={4}
              addonBefore={<BsQrCode />}
              placeholder={Strings.code}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.priorityCodeTooltip} />

          <Form.Item
            name="description"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredDescription },
              { max: 50 },
            ]}
            className="flex-1"
          >
            <Input
              size="large"
              maxLength={50}
              addonBefore={<BsCardText />}
              placeholder={Strings.description}
            />
          </Form.Item>

          <AnatomyTooltip title={Strings.priorityDescriptionTooltip} />
        </div>
        <div className="flex flex-wrap">
          <Form.Item
            name="days"
            validateFirst
            rules={[{ required: true, message: Strings.requiredDaysNumber }]}
            className="mr-1"
          >
            <InputNumber
              size="large"
              maxLength={3}
              addonBefore={<BsCalendar2Date />}
              placeholder={Strings.daysNumber}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.priorityDaysNumberTooltip} />

          {!isLoading && enableStatus && (
            <Form.Item name="status" className="w-60">
              <Select size="large" options={formatStatusOptions()} />
            </Form.Item>
          )}
        </div>
      </div>
    </Form>
  );
};

export default PriorityFormCard;
