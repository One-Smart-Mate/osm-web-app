import { Form, FormInstance, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";

const { Dragger } = Upload;

interface FormProps {
  form: FormInstance;
}

const ImportUsersForm = ({ form }: FormProps) => {
  return (
    <>
      <Form form={form} layout="vertical">
        <Form.Item
          name="fileObj"
          valuePropName="file"
          rules={[{ required: true, message: Strings.uploadFileRequired }]}
        >
          <Dragger
            maxCount={1}
            beforeUpload={() => false}
            name="file"
            accept=".xlsx"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">{Strings.dragFile}</p>
            <p className="ant-upload-hint">{Strings.singleUpload}</p>
          </Dragger>
        </Form.Item>
      </Form>
    </>
  );
};

export default ImportUsersForm;
