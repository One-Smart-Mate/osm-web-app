import { Form, FormInstance, Input } from "antd";
import React, { useEffect } from "react";
import { AmDiscardReason } from "../../../data/amDiscardReason/amDiscardReason";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { BsCardText } from "react-icons/bs";
import { AmDiscardReasonFormType } from "./AmDiscardReasonForm";

interface AmDiscardReasonFormCardProps {
  form: FormInstance;
  initialValues?: AmDiscardReason;
  onSubmit: (_values: any) => void;
  formType: AmDiscardReasonFormType;
}

const AmDiscardReasonFormCard = ({
  form,
  onSubmit,
  formType,
  initialValues,
}: AmDiscardReasonFormCardProps): React.ReactElement => {

  useEffect(() => {
    if (initialValues && formType === AmDiscardReasonFormType.UPDATE) {
      form.setFieldsValue({
        id: initialValues.id,
        discardReason: initialValues.discardReason,
      });
    }
  }, [initialValues, formType, form]);

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>

          <Form.Item
            name="discardReason"
            label={Strings.discardReason}
            validateFirst
            rules={[
              { required: true, message: Strings.requiredDiscardReason },
              { max: 45, message: Strings.maxCharactersAllowed.replace("{0}", "45") },
            ]}
            className="flex-1"
          >
            <Input
              maxLength={45}
              addonBefore={<BsCardText />}
              placeholder={Strings.discardReason}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.discardReasonTooltip} />
        </div>
      </div>
    </Form>
  );
};

export default AmDiscardReasonFormCard; 