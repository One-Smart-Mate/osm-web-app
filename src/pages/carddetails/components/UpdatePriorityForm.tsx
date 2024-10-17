import { Form, FormInstance, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetActiveSitePrioritiesMutation } from "../../../services/priorityService";
import { Priority } from "../../../data/priority/priority";

interface FormProps {
  form: FormInstance;
}

const UpdatePriorityForm = ({ form }: FormProps) => {
  const [getResponsibles] = useGetActiveSitePrioritiesMutation();
  const siteId = useAppSelector(selectSiteId);
  const [data, setData] = useState<Priority[]>([]);

  const handleGetResponsibles = async () => {
    const responsibles = await getResponsibles(siteId).unwrap();
    setData(responsibles);
  };
  useEffect(() => {
    handleGetResponsibles();
  }, []);

  const selectOptions = () => {
    return data.map((priority) => (
      <Select.Option key={priority.id} value={priority.id}>
        {priority.priorityCode} - {priority.priorityDescription}
      </Select.Option>
    ));
  };
  return (
    <Form form={form}>
      <div className="flex flex-row">
        <Form.Item
          name="priorityId"
          validateFirst
          rules={[{ required: true, message: Strings.requiredPriority }]}
          className="flex-1"
        >
          <Select size="large" placeholder={Strings.priority}>
            {selectOptions()}
          </Select>
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdatePriorityForm;
