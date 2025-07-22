import { Form, FormInstance, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { OplTypes } from "../../../data/oplTypes/oplTypes";
import Strings from "../../../utils/localizations/Strings";
import AnatomyTooltip from "../../components/AnatomyTooltip";
import { BsFileText } from "react-icons/bs";
import { useGetStatusMutation } from "../../../services/statusService";
import { Status } from "../../../data/status/status";

interface OplTypeFormCardProps {
  form: FormInstance;
  initialValues?: OplTypes;
  onSubmit: (values: any) => void;
  enableStatus: boolean;
}

const OplTypeFormCard = ({
  form,
  onSubmit,
  enableStatus,
  initialValues,
}: OplTypeFormCardProps): React.ReactElement => {
  const [getStatus, { isLoading }] = useGetStatusMutation();
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        documentType: initialValues.documentType,
        status: initialValues.status,
        id: Number(initialValues.id)
      });
    }
    if (enableStatus) {
      handleGetStatus();
    }
  }, []);

  const handleGetStatus = async () => {
    const response = await getStatus().unwrap();
    setStatusOptions(response);
  };

  const formatStatusOptions = () => {
    return statusOptions.map((status) => ({
      value: status.statusCode,
      label: status.statusName,
    }));
  };

  return (
    <Form form={form} onFinish={onSubmit} layout="vertical">
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap">
          <Form.Item name="id" className="hidden">
            <Input />
          </Form.Item>

          <Form.Item
            name="documentType"
            validateFirst
            label={Strings.documentType}
            rules={[
              { required: true, message: Strings.requiredDocumentType },
              { max: 50, message: "Document type must be 50 characters or less" },
            ]}
            className="flex-1 mr-1"
          >
            <Input
              maxLength={50}
              addonBefore={<BsFileText />}
              placeholder={Strings.documentType}
            />
          </Form.Item>
          <AnatomyTooltip title={Strings.oplTypeDescription} />
        </div>

        {enableStatus && (
          <div className="flex flex-row flex-wrap">
            <Form.Item
              name="status"
              label={Strings.status}
              validateFirst
              rules={[{ required: true, message: Strings.requiredStatus }]}
              className="flex-1"
            >
              <Select
                loading={isLoading}
                options={formatStatusOptions()}
                placeholder={Strings.selectStatus}
              />
            </Form.Item>
          </div>
        )}
      </div>
    </Form>
  );
};

export default OplTypeFormCard; 