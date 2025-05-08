import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Alert, Select } from 'antd';
import { CiltMstr, UpdateCiltMstrDTO } from '../../../data/cilt/ciltMstr/ciltMstr';
import { useUpdateCiltMstrMutation } from '../../../services/cilt/ciltMstrService';
import Constants from '../../../utils/Constants';
import Strings from '../../../utils/localizations/Strings';

const { Option } = Select;

interface CiltEditModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CiltEditModal: React.FC<CiltEditModalProps> = ({
  visible,
  cilt,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateCiltMstr, { isLoading: isUpdating }] = useUpdateCiltMstrMutation();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (cilt) {
        const dateOfLastUsed = cilt.dateOfLastUsed || new Date().toISOString();
        const updatedAt = new Date().toISOString();

        const updatedData = new UpdateCiltMstrDTO(
          cilt.id,
          dateOfLastUsed,
          updatedAt,
          cilt.siteId ?? undefined,
          cilt.positionId ?? undefined,
          values.ciltName,
          values.ciltDescription,
          cilt.creatorId ?? undefined,
          cilt.creatorName ?? undefined,
          cilt.reviewerId ?? undefined,
          cilt.reviewerName ?? undefined,
          cilt.approvedById ?? undefined,
          cilt.approvedByName ?? undefined,
          values.standardTime,
          values.learnigTime,
          cilt.urlImgLayout ?? undefined,
          cilt.order ?? undefined,
          values.status
        );
        await updateCiltMstr(updatedData).unwrap();
        onSuccess();
      }
    } catch (err: any) {
      console.error('Failed to update CILT:', err);
      setUpdateError(err.data?.message || err.message || Strings.ciltMstrUpdateError);
    }
  };

  const handleCancel = () => {
    setUpdateError(null);
    onCancel();
  };

  // Reset form with cilt values when modal becomes visible
  React.useEffect(() => {
    if (visible && cilt) {
      form.setFieldsValue({
        ciltName: cilt.ciltName,
        ciltDescription: cilt.ciltDescription,
        standardTime: cilt.standardTime,
        learnigTime: cilt.learnigTime,
        status: cilt.status,
      });
    }
  }, [visible, cilt, form]);

  return (
    <Modal
      title={Strings.ciltMstrEditModalTitle}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isUpdating}
      okText={Strings.ciltMstrSaveChangesButton}
      cancelText={Strings.ciltMstrCancelButton}
      destroyOnHidden
    >
      {updateError && <Alert message={updateError} type="error" showIcon closable onClose={() => setUpdateError(null)} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" name="edit_cilt_form" initialValues={cilt ?? {}}>
        <Form.Item name="ciltName" label={Strings.ciltMstrNameLabel} rules={[{ required: true, message: Strings.ciltMstrNameRequired }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ciltDescription" label={Strings.ciltMstrDescriptionLabel}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="standardTime" label={Strings.ciltMstrStandardTimeLabel} rules={[{ type: 'number', message: Strings.ciltMstrInvalidNumberMessage }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="learnigTime" label={Strings.ciltMstrLearningTimeLabel}>
          <Input />
        </Form.Item>
        <Form.Item name="status" label={Strings.ciltMstrStatusLabel} rules={[{ required: true, message: Strings.ciltMstrStatusRequired }]}>
          <Select placeholder={Strings.ciltMstrStatusPlaceholder}>
            <Option value={Constants.STATUS_ACTIVE}>{Strings.ciltMstrStatusActive}</Option>
            <Option value={Constants.STATUS_SUSPENDED}>{Strings.ciltMstrStatusSuspended}</Option>
            <Option value={Constants.STATUS_CANCELED}>{Strings.ciltMstrStatusCanceled}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CiltEditModal;