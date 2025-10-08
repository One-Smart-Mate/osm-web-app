import { useEffect } from "react";
import { Button, Form, FormInstance, Input, Tooltip } from "antd";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { QuestionCircleOutlined } from "@ant-design/icons";
import Strings from "../../../../utils/localizations/Strings";

interface FormProps {
  form: FormInstance;
  initialValues?: {
    id?: number;
    code?: string;
    description?: string;
    status?: string;
  };
}

const RegisterPreclassifierForm2 = ({ form, initialValues }: FormProps) => {
// Effect to set initial values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        code: initialValues.code,
        description: initialValues.description,
      });
    }
  }, [initialValues, form]);

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Form.Item
              name="code"
              validateFirst
              rules={[{ required: true, message: Strings.requiredCode }]}
            >
              <Input
                size="large"
                maxLength={6}
                addonBefore={<CiBarcode />}
                placeholder={Strings.code}
              />
            </Form.Item>
          </div>
          <Tooltip title={Strings.preclassifierCodeTooltip}>
            <QuestionCircleOutlined className="text-blue-500 mt-3 text-sm cursor-pointer" />
          </Tooltip>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1">
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
          </div>
          <Tooltip title={Strings.preclassifierDescriptionTooltip}>
            <QuestionCircleOutlined className="text-blue-500 mt-3 text-sm cursor-pointer" />
          </Tooltip>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button type="primary" htmlType="submit">
            {Strings.save}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default RegisterPreclassifierForm2;
