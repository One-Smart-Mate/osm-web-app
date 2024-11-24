import { Form, FormInstance, Input, InputNumber, Select, Tooltip } from "antd";
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
import { QuestionCircleOutlined } from "@ant-design/icons";

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
            <div className="flex items-center">
              <Input
                size="large"
                maxLength={4}
                addonBefore={<CiBarcode />}
                placeholder={Strings.code}
              />
              <Tooltip title="A unique alphanumeric code representing the priority (e.g., '7D' for seven days). Maximum 4 characters.">
                <QuestionCircleOutlined className="ml-2 mr-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
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
            <div className="flex items-center">
              <Input
                size="large"
                maxLength={50}
                addonBefore={<BsCardText />}
                placeholder={Strings.description}
              />
              <Tooltip title="A brief description of the priority. Use clear, concise language. Maximum 50 characters.">
                <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
        </div>
        <div className="flex flex-wrap">
          <Form.Item
            name="priorityDays"
            validateFirst
            rules={[{ required: true, message: Strings.requiredDaysNumber }]}
            className="mr-1"
          >
            <div className="flex items-center">
              <InputNumber
                size="large"
                maxLength={3}
                addonBefore={<AiOutlineFieldNumber />}
                placeholder={Strings.daysNumber}
              />
              <Tooltip title="The number of days associated with this priority. Must be a positive number.">
                <QuestionCircleOutlined className="ml-2 mr-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
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
