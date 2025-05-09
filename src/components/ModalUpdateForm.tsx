import React from "react";
import { Form, Modal } from "antd";
import type { FormInstance } from "antd";
import Strings from "../utils/localizations/Strings";

interface ModalUpdateFormProps {
  open: boolean;
  onCancel: () => void;
  title: string;
  FormComponent: React.ComponentType<{ form: FormInstance; initialValues: any }>;
  isLoading: boolean;
}

const ModalUpdateForm = ({
  open,
  onCancel,
  title,
  FormComponent,
  isLoading,
}: ModalUpdateFormProps) => {
  const [form] = Form.useForm();

  const handleOnOk = () => {
    if (!isLoading) {
      form.submit();
    }
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Modal
        onOk={handleOnOk}
        okText={Strings.save}
        width={810}
        title={title}
        open={open}
        onCancel={onCancel}
        cancelText={Strings.cancel}
        confirmLoading={isLoading}
        destroyOnHidden
      >
        <FormComponent form={form} initialValues={{}} />
      </Modal>
    </div>
  );
};

export default ModalUpdateForm;
