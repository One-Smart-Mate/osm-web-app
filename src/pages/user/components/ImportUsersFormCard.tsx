import { Form, FormInstance, Upload, App as AntApp } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";

const { Dragger } = Upload;

interface FormProps {
  form: FormInstance;
}

const ImportUsersFormCard = ({ form }: FormProps) => {
  const { message } = AntApp.useApp();

  const handleBeforeUpload = (file: File) => {
    // Validate file extension
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx');
    const isXlsm = file.name.toLowerCase().endsWith('.xlsm');
    const isXls = file.name.toLowerCase().endsWith('.xls');

    if (!isXlsx && !isXlsm && !isXls) {
      message.error(`${file.name} ${Strings.invalidFileType}. ${Strings.onlyExcelFiles}`);
      return Upload.LIST_IGNORE;
    }

    // Validate file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(Strings.fileTooLarge);
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  return (
    <Form form={form} name="importUsersForm" layout="vertical">
      <Form.Item
        name="fileObj"
        valuePropName="file"
        rules={[{ required: true, message: Strings.uploadFileRequired }]}
      >
        <Dragger
          maxCount={1}
          beforeUpload={handleBeforeUpload}
          name="file"
          accept=".xlsx,.xlsm,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12,application/vnd.ms-excel"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{Strings.dragFile}</p>
          <p className="ant-upload-hint">{Strings.onlyExcelFiles}</p>
        </Dragger>
      </Form.Item>
    </Form>
  );
};

export default ImportUsersFormCard;
