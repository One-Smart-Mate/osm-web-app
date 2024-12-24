import { Checkbox, Form, FormInstance, Input, Select } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { LuTextCursor } from "react-icons/lu";
import { useAppSelector } from "../../../core/store";
import { useEffect, useState } from "react";
import { selectSiteId } from "../../../core/genericReducer";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { Responsible } from "../../../data/user/user";
import { useGetStatusMutation } from "../../../services/statusService";
import { Status } from "../../../data/status/status";
import { CiBarcode } from "react-icons/ci";

interface FormProps {
  form: FormInstance;
  initialValues: any;
}

const UpdateLevelForm = ({ form, initialValues }: FormProps) => {
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
      notify: initialValues?.notify !== undefined ? Number(initialValues.notify) : 0, // Convertir a número
    };

    if (defaultValues) {
      form.setFieldsValue(defaultValues);
    }
  }, [initialValues, form]);

  const responsibleOptions = () => {
    const options = responsibles.map((responsible) => ({
      value: responsible.id,
      label: responsible.name,
    }));
    options.push({ value: "0", label: Strings.none });
    return options;
  };

  const statusOptions = () => {
    return statuses.map((status) => ({
      value: status.statusCode,
      label: status.statusName,
    }));
  };

  return (
    <Form form={form} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
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
            rules={[{ required: true, message: Strings.requiredDescription }, { max: 100 }]}
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
        <div className="flex gap-1 flex-wrap">
          <Form.Item name="responsibleId" className="flex-1">
            <Select
              size="large"
              placeholder={Strings.responsible}
              options={responsibleOptions()}
            />
          </Form.Item>
          <Form.Item name="levelMachineId" className="md:flex-1 w-2/3">
            <Input
              size="large"
              maxLength={50}
              addonBefore={<CiBarcode />}
              placeholder={Strings.levelMachineId}
            />
          </Form.Item>
        </div>
        <div className="flex gap-3">
          <Form.Item name="status" className="w-60">
            <Select size="large" options={statusOptions()} />
          </Form.Item>
          <Form.Item name="notify" valuePropName="checked">
            <Checkbox>
              <p className="text-base">{Strings.notify}</p>
            </Checkbox>
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default UpdateLevelForm;
