import { Checkbox, Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText, BsQrCodeScan } from "react-icons/bs";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { Responsible } from "../../../data/user/user";

const LabelWithHelp = ({ text, help }: { text: string; help: string }) => (
  <span className="inline-flex items-center">
    {text}
    <AnatomyTooltip title={help} />
  </span>
);

interface RegisterLevelFormProps {
  form: FormInstance;
}

const RegisterLevelForm = ({ form }: RegisterLevelFormProps) => {
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
    return data
      .map((responsible) => ({
        value: responsible.id,
        label: responsible.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  return (
    <Form form={form} layout="vertical" className="flex flex-col gap-1 w-full">
      <Form.Item
        name="name"
        validateFirst
        label={<LabelWithHelp text={Strings.name} help={Strings.levelNameTooltip} />}
        rules={[{ required: true, message: Strings.name }]}
      >
        <Input
          maxLength={45}
          showCount
          addonBefore={<BsCardText />}
          placeholder={Strings.name}
        />
      </Form.Item>

      <Form.Item
        name="description"
        validateFirst
        label={<LabelWithHelp text={Strings.description} help={Strings.levelDescriptionTooltip} />}
        rules={[{ required: true, message: Strings.requiredDescription }]}
      >
        <Input
          maxLength={100}
          showCount
          addonBefore={<BsCardText />}
          placeholder={Strings.description}
        />
      </Form.Item>

      <Form.Item
        name="responsibleId"
        label={<LabelWithHelp text={Strings.responsible} help={Strings.levelResponsibleTooltip} />}
        rules={[{ required: true, message: Strings.responsibleRequired }]}
      >
        <Select
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

      <Form.Item name="levelMachineId" label={<LabelWithHelp text={Strings.levelMachineId} help={Strings.levelMachineIdTooltip} />}>
        <Input
          maxLength={50}
          showCount
          addonBefore={<BsQrCodeScan />}
          placeholder={Strings.levelMachineId}
        />
      </Form.Item>

      <Form.Item name="notify" valuePropName="checked" label={<LabelWithHelp text={Strings.notify} help={Strings.levelNotifyTooltip} />}>
        <Checkbox>
          <p className="text-base">{Strings.notify}</p>
        </Checkbox>
      </Form.Item>

      <Form.Item name="assignWhileCreate" valuePropName="checked" label={<LabelWithHelp text={Strings.assignCardOnCreate} help={Strings.levelAssignCardOnCreateTooltip} />}>
        <Checkbox>
          <p className="text-base">{Strings.assignCardOnCreate}</p>
        </Checkbox>
      </Form.Item>

      {/* Hidden field */}
      <Form.Item name="superiorId" hidden>
        <Input type="hidden" />
      </Form.Item>
    </Form>
  );
};

export default RegisterLevelForm;
