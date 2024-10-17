import { Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../core/store";
import { selectCurrentRowData } from "../../../core/genericReducer";
import { useGetStatusMutation } from "../../../services/statusService";
import { Status } from "../../../data/status/status";

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
        <div className="flex flex-row justify-between flex-wrap">
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
          <Form.Item name="status" className="w-60">
            <Select size="large" options={statusOptions()} />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default UpdatePreclassifierForm;
