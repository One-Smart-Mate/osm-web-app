import { Form, FormInstance, Input, InputNumber, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { useAppSelector } from "../../../core/store";
import { Site } from "../../../data/site/site";
import { selectCurrentRowData } from "../../../core/genericReducer";
import { useEffect, useState } from "react";
import { Status } from "../../../data/status/status";
import { useGetStatusMutation } from "../../../services/statusService";

interface FormProps {
  form: FormInstance;
}

const UpdatePriorityForm = ({ form }: FormProps) => {
  const [getStatus] = useGetStatusMutation();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const rowData = useAppSelector(selectCurrentRowData) as unknown as Site;

  const handleGetData = async () => {
    const statusesResponse = await getStatus().unwrap();
    setStatuses(statusesResponse);
  };

  const statusOptions = () => {
    return statuses.map((status) => ({
      value: status.statusCode,
      label: status.statusName,
    }));
  };
  useEffect(() => {
    handleGetData();
    form.setFieldsValue({ ...rowData });
  }, []);
  return (
    <Form form={form}>
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>
          <Form.Item
            name="priorityCode"
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
              addonBefore={<CiBarcode />}
              placeholder={Strings.code}
            />
          </Form.Item>
          <Form.Item
            name="priorityDescription"
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
        </div>
        <div className="flex flex-wrap">
          <Form.Item
            name="priorityDays"
            validateFirst
            rules={[{ required: true, message: Strings.requiredDaysNumber }]}
            className="mr-1"
          >
            <InputNumber
              size="large"
              maxLength={3}
              addonBefore={<AiOutlineFieldNumber />}
              placeholder={Strings.daysNumber}
            />
          </Form.Item>
          <Form.Item name="status" className="w-60">
            <Select size="large" options={statusOptions()} />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default UpdatePriorityForm;
