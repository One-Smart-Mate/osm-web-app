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
    <Form form={form} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="name"
            validateFirst
            rules={[{ required: true, message: Strings.name }, { max: 45 }]}
            className="mr-1"
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
              { max: 100 },
            ]}
            className="md:flex-1 w-2/3"
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<BsCardText />}
              placeholder={Strings.description}
            />
          </Form.Item>
        </div>
        <div className="flex flex-wrap gap-1">
          <Form.Item name="responsibleId" className="flex-1">
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
          <Form.Item name="levelMachineId" className="md:flex-1">
            <Input
              size="large"
              maxLength={50}
              addonBefore={<CiBarcode />}
              placeholder={Strings.levelMachineId}
            />
          </Form.Item>
        </div>
        <Form.Item name="notify" valuePropName="checked">
          <Checkbox>
            <p className="text-base">{Strings.notify}</p>
          </Checkbox>
        </Form.Item>
      </div>
    </Form>
  );
};

export default RegisterLevelForm;
