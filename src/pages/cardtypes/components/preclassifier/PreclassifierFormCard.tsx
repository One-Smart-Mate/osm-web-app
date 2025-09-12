import React, { useEffect, useState } from "react";
import { Button, Form, FormInstance, Input, Select } from "antd";
import { BsCardText } from "react-icons/bs";
import { CiBarcode } from "react-icons/ci";
import { useGetStatusMutation } from "../../../../services/statusService";
import { Status } from "../../../../data/status/status";
import Strings from "../../../../utils/localizations/Strings";
import AnatomyTooltip from "../../../components/AnatomyTooltip";

interface PreclassifierFormCardProps {
  form: FormInstance;
  initialValues?: any;
  onSubmit: (_values: any) => void;
  enableStatus: boolean;
}

const PreclassifierFormCard = ({
  form,
  initialValues,
  enableStatus,
  onSubmit,
}: PreclassifierFormCardProps): React.ReactElement => {
  const [getStatus] = useGetStatusMutation();
  const [status, setStatus] = useState<Status[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        id: initialValues.id,
        code: initialValues.preclassifierCode,
        description: initialValues.preclassifierDescription,
        status: initialValues.status ?? Strings.activeStatus,
      });
    }
    handleGetStatus();
  }, []);

  const handleGetStatus = async () => {
    try {
      const statusResponse = await getStatus().unwrap();
      setStatus(statusResponse);
    } catch (err) {
      console.error("Error fetching status", err);
    }
  };

  const statusOptions = () => {
    return status.map((st) => ({
      value: st.statusCode,
      label: st.statusName,
    }));
  };

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <Form.Item name="id" className="hidden">
        <Input />
      </Form.Item>

      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="flex-1">
            <Form.Item
              name="code"
              label={Strings.code}
              validateFirst
              rules={[{ required: true, message: Strings.requiredCode }]}
            >
              <Input
                maxLength={3}
                addonBefore={<CiBarcode />}
                placeholder={Strings.code}
              />
            </Form.Item>
          </div>
          <AnatomyTooltip title={Strings.preclassifierCodeTooltip} />
        </div>

        <div className="flex items-center">
          <div className="flex-1">
            <Form.Item
              name="description"
              label={Strings.description}
              validateFirst
              rules={[{ required: true, message: Strings.requiredDescription }]}
            >
              <Input
                maxLength={100}
                addonBefore={<BsCardText />}
                placeholder={Strings.description}
              />
            </Form.Item>
          </div>
          <AnatomyTooltip title={Strings.preclassifierDescriptionTooltip} />
        </div>

        {enableStatus && (
          <div className="flex items-center">
            <div className="flex-1">
              <Form.Item name="status" label={Strings.status}>
                <Select size="large" options={statusOptions()} />
              </Form.Item>
            </div>
            <AnatomyTooltip title={Strings.preclassifierStatusTooltip} />
          </div>
        )}
      </div>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          {Strings.save}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PreclassifierFormCard;
