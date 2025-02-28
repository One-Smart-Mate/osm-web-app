// ./components/preclassifier/UpdatePreclassifierForm2.tsx
import React, { useEffect, useState } from "react";
import { Button, Form, FormInstance, Input, Select, Tooltip } from "antd";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useGetStatusMutation } from "../../../../services/statusService";
import { Status } from "../../../../data/status/status";
import Strings from "../../../../utils/localizations/Strings";
import { notification } from "antd";

interface UpdatePreclassifierForm2Props {
  form: FormInstance;
  //We pass an 'initialValues' with the preclassifier data to edit
  initialValues?: {
    id?: number;
    preclassifierCode?: string;
    preclassifierDescription?: string;
    status?: string;
  };
}

const UpdatePreclassifierForm2: React.FC<UpdatePreclassifierForm2Props> = ({
  form,
  initialValues,
}) => {
  const [getStatus] = useGetStatusMutation();
  const [statuses, setStatuses] = useState<Status[]>([]);



  useEffect(() => {
    (async () => {
      try {
        const statusResponse = await getStatus().unwrap();
        setStatuses(statusResponse);
      } catch (err) {
        console.error("Error fetching status", err);
        notification.error({
          message: "Fetching Error",
          description: "Error fetching status",
          placement: "topRight",
        });
      }
    })();
  }, [getStatus]);

  //When 'initialValues' changes, we set the fields in the form
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        id: initialValues.id,
        code: initialValues.preclassifierCode,
        description: initialValues.preclassifierDescription,
        status: initialValues.status ?? Strings.activeStatus,
      });
    }
  }, [initialValues, form]);

  const statusOptions = () => {
    return statuses.map((st) => ({
      value: st.statusCode,
      label: st.statusName,
    }));
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="id" className="hidden">
        <Input />
      </Form.Item>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Form.Item
              name="code"
              label={Strings.code}
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
          </div>
          <Tooltip title={Strings.preclassifierCodeTooltip}>
            <QuestionCircleOutlined className="text-blue-500 mt-10 text-sm cursor-pointer" />
          </Tooltip>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Form.Item
              name="description"
              label={Strings.description}
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
          </div>
          <Tooltip title={Strings.preclassifierDescriptionTooltip}>
            <QuestionCircleOutlined className="text-blue-500 mt-10 text-sm cursor-pointer" />
          </Tooltip>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Form.Item name="status" label={Strings.status}>
              <Select size="large" options={statusOptions()} />
            </Form.Item>
          </div>
          <Tooltip title={Strings.preclassifierStatusTooltip}>
            <QuestionCircleOutlined className="text-blue-500 mt-10 text-sm cursor-pointer" />
          </Tooltip>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <Button type="primary" htmlType="submit">
          {Strings.save}
        </Button>
      </div>
    </Form>
  );
};

export default UpdatePreclassifierForm2;
