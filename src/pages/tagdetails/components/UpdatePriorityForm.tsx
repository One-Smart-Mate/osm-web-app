import { Form, FormInstance, Select, DatePicker } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetActiveSitePrioritiesMutation } from "../../../services/priorityService";
import { Priority } from "../../../data/priority/priority";
import Constants from "../../../utils/Constants";
import dayjs from "dayjs";

interface FormProps {
  form: FormInstance;
  cardId?: number;
}

const UpdatePriorityForm = ({ form, cardId }: FormProps) => {
  const [getResponsibles] = useGetActiveSitePrioritiesMutation();
  const siteId = useAppSelector(selectSiteId);
  const [data, setData] = useState<Priority[]>([]);
  const [selectedPriorityId, setSelectedPriorityId] = useState<number | null>(null);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const handleGetResponsibles = async () => {
    const responsibles = await getResponsibles(siteId).unwrap();
    setData(responsibles);
  };
  useEffect(() => {
    handleGetResponsibles();
  }, []);

  const handlePriorityChange = (priorityId: number) => {
    setSelectedPriorityId(priorityId);
    const selectedPriority = data.find(p => p.id === priorityId);

    if (selectedPriority && selectedPriority.priorityCode === Constants.PRIORITY_WILDCARD_CODE) {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      form.setFieldsValue({ customDueDate: undefined });
    }
  };

  const selectOptions = () => {
    return data.map((priority) => (
      <Select.Option key={priority.id} value={priority.id}>
        {priority.priorityCode} - {priority.priorityDescription}
      </Select.Option>
    ));
  };
  return (
    <Form form={form}>
      <div className="flex flex-col gap-3">
        <Form.Item
          name="priorityId"
          validateFirst
          rules={[{ required: true, message: Strings.requiredPriority }]}
          className="flex-1"
        >
          <Select
            size="large"
            placeholder={Strings.priority}
            onChange={handlePriorityChange}
          >
            {selectOptions()}
          </Select>
        </Form.Item>

        {showCustomDate && (
          <Form.Item
            name="customDueDate"
            label={Strings.customDueDate}
            rules={[{ required: true, message: Strings.requiredCustomDate }]}
          >
            <DatePicker
              placeholder={Strings.selectDate}
              className="w-full"
              size="large"
              disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
            />
          </Form.Item>
        )}
      </div>
    </Form>
  );
};

export default UpdatePriorityForm;
