import React, { useEffect, useRef } from "react";
import { Form, FormInstance, Modal } from "antd";
import Strings from "../../utils/localizations/Strings";

interface ModalFormProps {
  open: boolean;
  onCancel: () => void;
  title: string;
  FormComponent: React.ComponentType<{ form: FormInstance }> | ((_form: FormInstance) => React.ReactNode);
  isLoading: boolean;
}

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({
  form,
  open,
}: {
  form: FormInstance;
  open: boolean;
}) => {
  const prevOpenRef = useRef<boolean>(false);
  useEffect(() => {
    prevOpenRef.current = open;
  }, [open]);
  const prevOpen = prevOpenRef.current;

  useEffect(() => {
    if (!open && prevOpen) {
      form.resetFields();
    }
  }, [form, prevOpen, open]);
};

const ModalForm = ({
  open,
  onCancel,
  title,
  FormComponent,
  isLoading,
}: ModalFormProps) => {
  const [form] = Form.useForm();

  useResetFormOnCloseModal({
    form,
    open,
  });

  const handleOnOk = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isLoading) {
      form.submit();
    }
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onCancel();
  };

  const renderFormComponent = () => {
    if (typeof FormComponent === "function") {
      try {
        const result = (FormComponent as unknown as (_form: FormInstance) => React.ReactNode)(form);
        if (React.isValidElement(result)) {
          return result;
        }
      } catch(error) {
        console.error(`[Component] Error rendering component ${error}`)
      }
    }
      const Component = FormComponent as React.ComponentType<{ form: FormInstance }>;
    return <Component form={form} />;
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Modal
        onOk={handleOnOk}
        okText={Strings.save}
        width={820}
        title={title}
        open={open}
        onCancel={handleCancel}
        cancelText={Strings.cancel}
        confirmLoading={isLoading}
        destroyOnHidden
      >
       {renderFormComponent()}
      </Modal>
    </div>
  );
};

export default ModalForm;
