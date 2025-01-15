import { Form, FormInstance, Input, Select, Tooltip } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../core/store";
import { selectCurrentRowData } from "../../../core/genericReducer";
import { useGetStatusMutation } from "../../../services/statusService";
import { Status } from "../../../data/status/status";
import Preclassifier from "../../../data/preclassifier/preclassifier";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface FormProps {
  form: FormInstance;
}

const UpdatePreclassifierForm = ({ form }: FormProps) => {
  const [getStatus] = useGetStatusMutation();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const rowData = useAppSelector(
    selectCurrentRowData
  ) as unknown as Preclassifier;

  const handleGetData = async () => {
    const statusResponse = await getStatus().unwrap();
    setStatuses(statusResponse);
  };

  const statusOptions = () => {
    return statuses.map((status) => ({
      value: status.statusCode,
      label: status.statusName,
    }));
  };

  useEffect(() => {
    handleGetData();
    form.setFieldsValue({
      ...rowData,
      code: rowData.preclassifierCode,
      description: rowData.preclassifierDescription,
    });
  }, []);
  return (
    <Form form={form}>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between ">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            validateFirst
            rules={[{ required: true, message: Strings.requiredCode }]}
          >
            <Input
              size="large"
              maxLength={3}
              addonBefore={<CiBarcode />}
              placeholder={Strings.code}
            />
          </Form.Item>
          <Tooltip title={Strings.preclassifierCodeTooltip}>
            <QuestionCircleOutlined className="ml-2 mr-1.5 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>

          <Form.Item
            name="description"
            validateFirst
            rules={[{ required: true, message: Strings.requiredDescription }]}
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<BsCardText />}
              placeholder={Strings.description}
            />
          </Form.Item>
          <Tooltip title={Strings.preclassifierDescriptionTooltip}>
            <QuestionCircleOutlined className="ml-2 mr-1.5 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>

          <Form.Item name="status" className="w-60">
            <Select size="large" options={statusOptions()} />
          </Form.Item>
          <Tooltip title={Strings.preclassifierStatusTooltip}>
            <QuestionCircleOutlined className="ml-2 mb-6 text-blue-500 text-sm cursor-pointer" />
          </Tooltip>
        </div>
      </div>
    </Form>
  );
};
export default UpdatePreclassifierForm;
