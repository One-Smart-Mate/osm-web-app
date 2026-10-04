import { Checkbox, Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText, BsQrCodeScan } from "react-icons/bs";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { Responsible } from "../../../data/user/user";
import { useGetStatusMutation } from "../../../services/statusService";
import { Status } from "../../../data/status/status";

interface UpdateLevelFormProps {
  form: FormInstance;
  initialValues: any;
}

const LabelWithHelp = ({ text, help }: { text: string; help: string }) => (
  <span className="inline-flex items-center">
    {text}
    <AnatomyTooltip title={help} />
  </span>
);

const UpdateLevelForm = ({ form, initialValues }: UpdateLevelFormProps) => {
  const [getResponsibles] = useGetSiteResponsiblesMutation();
  const [getStatus] = useGetStatusMutation();
  const siteId = useAppSelector(selectSiteId);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const handleGetData = async () => {
    const [responsiblesResponse, statusResponse] = await Promise.all([
      getResponsibles(siteId).unwrap(),
      getStatus().unwrap(),
    ]);
    setResponsibles(responsiblesResponse);
    setStatuses(statusResponse);
  };

  useEffect(() => {
    handleGetData();
    const defaultValues = {
      ...initialValues,
      notify: initialValues?.notify !== undefined ? Number(initialValues.notify) : 0,
    };

    if (defaultValues) {
      form.setFieldsValue(defaultValues);
    }
  }, [initialValues, form]);

  const responsibleOptions = () => {
    const options = responsibles
      .map((responsible) => ({
        value: responsible.id,
        label: responsible.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    options.push({ value: "0", label: Strings.none });
    return options;
  };

  const statusOptions = () => {
    return statuses
      .filter((status) => ["A", "I"].includes(status.statusCode))
      .map((status) => ({
      value: status.statusCode,
      label: status.statusName,
      }));
  };

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col gap-1">
        <Form.Item name="id" className="hidden">
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label={<LabelWithHelp text={Strings.name} help={Strings.levelNameTooltip} />}
          rules={[{ required: true, message: Strings.name }, { max: 45 }]}
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
          label={<LabelWithHelp text={Strings.description} help={Strings.levelDescriptionTooltip} />}
          rules={[
            { required: true, message: Strings.requiredDescription },
            { max: 100 },
          ]}
        >
          <Input
            maxLength={100}
            showCount
            addonBefore={<BsCardText />}
            placeholder={Strings.description}
          />
        </Form.Item>

        <Form.Item name="responsibleId" label={<LabelWithHelp text={Strings.responsible} help={Strings.levelResponsibleTooltip} />}>
          <Select
            placeholder={Strings.responsible}
            options={responsibleOptions()}
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

        <Form.Item
          name="status"
          label={<LabelWithHelp text={Strings.status} help={Strings.levelStatusTooltip} />}
          rules={[{ required: true, message: Strings.requiredStatus }]}
        >
          <Select placeholder={Strings.status} options={statusOptions()} />
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
      </div>
    </Form>
  );
};

export default UpdateLevelForm;
