import { Form, FormInstance, Input } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";

interface FormProps {
  form: FormInstance;
}

const RegisterPreclassifierForm = ({ form }: FormProps) => {
  return (
    <Form form={form}>
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="code"
            validateFirst
            rules={[{ required: true, message: Strings.requiredCode }]}
            className="mr-1"
          >
            <Input
              size="large"
              maxLength={3}
              addonBefore={<CiBarcode />}
              placeholder={Strings.code}
            />
          </Form.Item>
          <Form.Item
            name="description"
            validateFirst
            rules={[{ required: true, message: Strings.requiredDescription }]}
            className="flex-1"
          >
            <Input
              size="large"
              maxLength={100}
              addonBefore={<BsCardText />}
              placeholder={Strings.description}
            />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};

export default RegisterPreclassifierForm;
