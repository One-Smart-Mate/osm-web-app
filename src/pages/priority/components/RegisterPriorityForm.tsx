import { Form, FormInstance, Input, InputNumber, Tooltip } from "antd";
import Strings from "../../../utils/localizations/Strings";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { AiOutlineFieldNumber } from "react-icons/ai";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface FormProps {
  form: FormInstance;
}

const RegisterPriorityForm = ({ form }: FormProps) => {
  return (
    <Form form={form}>
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item
            name="code"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredCode },
              { max: 4 },
            ]}
            className="mr-1"
          >
            <div className="flex items-center">
              <Input
                size="large"
                maxLength={4}
                addonBefore={<CiBarcode />}
                placeholder={Strings.code}
              />
              <Tooltip title="A unique alphanumeric code representing the priority (e.g., '7D' for seven days). Maximum 4 characters.">
                <QuestionCircleOutlined className="ml-2 mr-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
          <Form.Item
            name="description"
            validateFirst
            rules={[
              { required: true, message: Strings.requiredDescription },
              { max: 50 },
            ]}
            className="flex-1"
          >
            <div className="flex items-center">
              <Input
                size="large"
                maxLength={50}
                addonBefore={<BsCardText />}
                placeholder={Strings.description}
              />
              <Tooltip title="A brief description of the priority. Use clear, concise language. Maximum 50 characters.">
                <QuestionCircleOutlined className="ml-2 mr-2 text-blue-500 text-sm" />
              </Tooltip>
            </div>
          </Form.Item>
        </div>
        <Form.Item
          name="daysNumber"
          validateFirst
          rules={[{ required: true, message: Strings.requiredDaysNumber }]}
          className="flex-1"
        >
          <div className="flex items-center">
            <InputNumber
              size="large"
              maxLength={3}
              addonBefore={<AiOutlineFieldNumber />}
              placeholder={Strings.daysNumber}
            />
            <Tooltip title="The number of days associated with this priority. Must be a positive number.">
              <QuestionCircleOutlined className="ml-2 text-blue-500 text-sm" />
            </Tooltip>
          </div>
        </Form.Item>
      </div>
    </Form>
  );
};

export default RegisterPriorityForm;
