import { Checkbox, Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { LuTextCursor } from "react-icons/lu";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { Responsible } from "../../../data/user/user";
import { CiBarcode } from "react-icons/ci";

interface FormProps {
  form: FormInstance;
}

const RegisterLevelForm = ({ form }: FormProps) => {
  const [getResponsibles] = useGetSiteResponsiblesMutation();
  const siteId = useAppSelector(selectSiteId);
  const [data, setData] = useState<Responsible[]>([]);

  const handleGetResponsibles = async () => {
    const responsibles = await getResponsibles(siteId).unwrap();
    setData(responsibles);
  };

  useEffect(() => {
    handleGetResponsibles();
  }, []);

  const selectOptions = () => {
    return data.map((responsible) => ({
      value: responsible.id,
      label: responsible.name,
    }));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="flex flex-col gap-1 w-full"
    >
      <Form.Item
        name="name"
        validateFirst
        rules={[
          { required: true, message: Strings.name },
          
        ]}
      >
        <Input
          size="large"
          maxLength={45}
          addonBefore={<LuTextCursor />}
          placeholder={Strings.name}
        />
      </Form.Item>

      <Form.Item
        name="description"
        validateFirst
        rules={[
          { required: true, message: Strings.requiredDescription },
          
        ]}
      >
        <Input
          size="large"
          maxLength={100}
          addonBefore={<BsCardText />}
          placeholder={Strings.description}
        />
      </Form.Item>

      <Form.Item
  name="responsibleId"
  rules={[{ required: true, message: Strings.responsibleRequired }]}>
  <Select
    size="large"
    placeholder={Strings.responsible}
    options={selectOptions()}
    showSearch
    filterOption={(input, option) => {
      if (!option) {
        return false;
      }
      return option.label.toLowerCase().includes(input.toLowerCase());
    }}
  />
</Form.Item>


      <Form.Item name="levelMachineId">
        <Input
          size="large"
          maxLength={50}
          addonBefore={<CiBarcode />}
          placeholder={Strings.levelMachineId}
        />
      </Form.Item>

      <Form.Item name="notify" valuePropName="checked">
        <Checkbox>
          <p className="text-base">{Strings.notify}</p>
        </Checkbox>
      </Form.Item>

      {/* Campo oculto */}
      <Form.Item name="superiorId" hidden>
        <Input type="hidden" />
      </Form.Item>
    </Form>
  );
};

export default RegisterLevelForm;
