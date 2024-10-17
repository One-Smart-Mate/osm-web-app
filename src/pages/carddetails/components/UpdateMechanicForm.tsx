import { Form, FormInstance, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetSiteMechanicsMutation } from "../../../services/userService";
import { Responsible } from "../../../data/user/user";

interface FormProps {
  form: FormInstance;
}

const UpdateMechanicForm = ({ form }: FormProps) => {
  const [getMechanics] = useGetSiteMechanicsMutation();
  const siteId = useAppSelector(selectSiteId);
  const [data, setData] = useState<Responsible[]>([]);

  const handleGetMechanics = async () => {
    const mechanics = await getMechanics(siteId).unwrap();
    setData(mechanics);
  };
  useEffect(() => {
    handleGetMechanics();
  }, []);

  const selectOptions = () => {
    return data.map((mechanic) => (
      <Select.Option key={mechanic.id} value={mechanic.id}>
        {mechanic.name}
      </Select.Option>
    ));
  };
  return (
    <Form form={form}>
      <div className="flex flex-row">
        <Form.Item
          name="mechanicId"
          validateFirst
          rules={[{ required: true, message: Strings.requiredMechanic }]}
          className="flex-1"
        >
          <Select size="large" placeholder={Strings.mechanic}>
            {selectOptions()}
          </Select>
        </Form.Item>
      </div>
    </Form>
  );
};

export default UpdateMechanicForm;
