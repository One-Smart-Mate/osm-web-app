import React from "react";
import { Form, Input, Button } from "antd";
import Strings from "../../../utils/localizations/Strings";

const { TextArea } = Input;

interface OplTextFormProps {
  form: any;
  onSubmit: (values: any) => void;
}

const OplTextForm: React.FC<OplTextFormProps> = ({ form, onSubmit }) => {
  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item
        name="text"
        label={Strings.oplTextFormLabel}
        rules={[
          { required: true, message: Strings.oplTextFormValidationMessage },
        ]}
      >
        <TextArea rows={6} placeholder={Strings.oplTextFormPlaceholder} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {Strings.oplTextFormSubmitButton}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OplTextForm;
