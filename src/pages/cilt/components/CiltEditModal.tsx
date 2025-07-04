import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Alert, Select, Upload, Spin, notification, Typography, Popconfirm, Button } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadFileToFirebaseWithPath } from '../../../config/firebaseUpload';
import { CiltMstr, UpdateCiltMstrDTO } from '../../../data/cilt/ciltMstr/ciltMstr';
import { useUpdateCiltMstrMutation } from '../../../services/cilt/ciltMstrService';
import { useGetSiteResponsiblesMutation } from '../../../services/userService';
import Constants from '../../../utils/Constants';
import Strings from '../../../utils/localizations/Strings';
import UserSelectionModal from '../../../pages/components/UserSelectionModal';
import { Responsible } from '../../../data/user/user';

const { Option } = Select;
const { Text } = Typography;

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
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [creatorModalVisible, setCreatorModalVisible] = useState(false);
  const [reviewerModalVisible, setReviewerModalVisible] = useState(false);
  const [approverModalVisible, setApproverModalVisible] = useState(false);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [creatorId, setCreatorId] = useState<number | undefined>(undefined);
  const [reviewerId, setReviewerId] = useState<number | undefined>(undefined);
  const [approvedById, setApprovedById] = useState<number | undefined>(undefined);
  
  // Update user IDs whenever cilt changes
  useEffect(() => {
    if (cilt) {
      setCreatorId(cilt.creatorId ? Number(cilt.creatorId) : undefined);
      setReviewerId(cilt.reviewerId ? Number(cilt.reviewerId) : undefined);
      setApprovedById(cilt.approvedById ? Number(cilt.approvedById) : undefined);
    } else {
      setCreatorId(undefined);
      setReviewerId(undefined);
      setApprovedById(undefined);
    }
  }, [cilt]);
  
  useEffect(() => {
    fetchResponsibles();
  }, [cilt, getSiteResponsibles]);
  
  // Debug effect to track cilt changes
  useEffect(() => {
    if (cilt) {
      console.log('CILT data changed:', {
        id: cilt.id,
        ciltName: cilt.ciltName,
        creatorId: cilt.creatorId,
        creatorName: cilt.creatorName,
        reviewerId: cilt.reviewerId,
        reviewerName: cilt.reviewerName,
        approvedById: cilt.approvedById,
        approvedByName: cilt.approvedByName,
        siteId: cilt.siteId
      });
    }
  }, [cilt]);

  const fetchResponsibles = async () => {
    if (cilt && cilt.siteId) {
      setLoading(true);
      try {
        const response = await getSiteResponsibles(String(cilt.siteId)).unwrap();
        setResponsibles(response || []);
      } catch (error) {
        console.error("Error fetching responsibles:", error);
        setResponsibles([]);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No cilt or siteId available for fetching responsibles');
      setResponsibles([]);
    }
  };

  const handleCreatorSelection = (userIds: number[]) => {
    if (userIds.length > 0) {
      const selectedUserId = userIds[0];
      setCreatorId(selectedUserId);
      // Find the user by comparing with the same type
      const selectedUser = responsibles.find(user => Number(user.id) === selectedUserId);
      form.setFieldsValue({ creatorName: selectedUser?.name || "" });
    } else {
      setCreatorId(undefined);
      form.setFieldsValue({ creatorName: "" });
    }
    setCreatorModalVisible(false);
  };
  
  const handleReviewerSelection = (userIds: number[]) => {
    if (userIds.length > 0) {
      const selectedUserId = userIds[0];
      setReviewerId(selectedUserId);
      // Find the user by comparing with the same type
      const selectedUser = responsibles.find(user => Number(user.id) === selectedUserId);
      form.setFieldsValue({ reviewerName: selectedUser?.name || "" });
    } else {
      setReviewerId(undefined);
      form.setFieldsValue({ reviewerName: "" });
    }
    setReviewerModalVisible(false);
  };
  
  const handleApproverSelection = (userIds: number[]) => {
    if (userIds.length > 0) {
      const selectedUserId = userIds[0];
      setApprovedById(selectedUserId);
      // Find the user by comparing with the same type
      const selectedUser = responsibles.find(user => Number(user.id) === selectedUserId);
      form.setFieldsValue({ approvedByName: selectedUser?.name || "" });
    } else {
      setApprovedById(undefined);
      form.setFieldsValue({ approvedByName: "" });
    }
    setApproverModalVisible(false);
  };

  // Functions for image upload
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    // Open the image in a new tab
    if (file.url) {
      window.open(file.url);
    } else if (file.preview) {
      window.open(file.preview as string);
    }
  };

  // Handle file selection for image upload
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Upload button for the Upload component
  const uploadButton = (
    <div>
      {uploading ? <Spin /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Save changes handler, uploads image if needed and updates CILT
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!cilt) {
        notification.error({
          message: Strings.error,
          description: "CILT data is missing.",
        });
        return;
      }
      // Require an image
      if (fileList.length === 0) {
        notification.error({
          message: Strings.error,
          description: Strings.registerCiltLayoutImageRequiredValidation,
          duration: 4,
        });
        return;
      }
      setUploading(true);
      let imageUrl = cilt.urlImgLayout; // Default to existing image
      // If a new file is selected, upload it to Firebase with the correct path structure
      const file = fileList[0];
      if (file.originFileObj) {
        // Use the required path: site_{siteId}/cilt/{ciltID}/images/{name}
        const path = `site_${cilt.siteId}/cilt/${cilt.id}/images/${file.name}`;
        imageUrl = await uploadFileToFirebaseWithPath(path, file);
      }
      const dateOfLastUsed = cilt.dateOfLastUsed || new Date().toISOString();
      const updatedAt = new Date().toISOString();
      // Ensure ciltDueDate is never null for type safety
      let safeCiltDueDate: string | undefined = undefined;
      if (values.ciltDueDate && values.ciltDueDate !== '' && values.ciltDueDate !== null) {
        safeCiltDueDate = values.ciltDueDate as string;
      }
      // Utility to ensure no null or empty string is passed to DTO
      const cleanString = (v: string | null | undefined): string | undefined => (v && v !== '' ? v : undefined);
      const updatedData = new UpdateCiltMstrDTO(
        cilt.id,
        dateOfLastUsed,
        updatedAt,
        cilt.siteId ?? undefined,
        cleanString(values.ciltName),
        cleanString(values.ciltDescription),
        creatorId ?? undefined,
        cleanString(values.creatorName),
        reviewerId ?? undefined,
        cleanString(values.reviewerName),
        approvedById ?? undefined,
        cleanString(values.approvedByName),
        values.standardTime !== null && values.standardTime !== '' ? Number(values.standardTime) : undefined,
        imageUrl ?? undefined,
        cilt.order ?? undefined,
        cleanString(values.status),
        // Only pass string or undefined, never null
        (safeCiltDueDate ? `${safeCiltDueDate}T00:00:00.000Z` : undefined)
      );
      await updateCiltMstr(updatedData).unwrap();
      notification.success({
        message: Strings.success,
        description: Strings.ciltMstrUpdateSuccess || 'CILT actualizado correctamente',
      });
      onSuccess();
    } catch (err: any) {
      console.error('Failed to update CILT:', err);
      setUpdateError(err.data?.message || err.message || Strings.ciltMstrUpdateError);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setUpdateError(null);
    setFileList([]);
    onCancel();
  };

  // Text to display when no image is assigned
  const NO_IMAGE_TEXT = "No image assigned";

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "--";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Reset form with cilt values when modal becomes visible
  useEffect(() => {
    if (visible && cilt) {
      form.setFieldsValue({
        ciltName: cilt.ciltName,
        ciltDescription: cilt.ciltDescription,
        // standardTime removed - now calculated automatically in the database
        ciltDueDate: cilt.ciltDueDate ? cilt.ciltDueDate.split('T')[0] : undefined, // Always undefined, never null
        status: cilt.status,
        creatorName: cilt.creatorName || '',
        reviewerName: cilt.reviewerName || '',
        approvedByName: cilt.approvedByName || '',
      });
      
      // If there's an existing image, add it to the fileList
      if (cilt.urlImgLayout) {
        const existingFile: UploadFile = {
          uid: '-1',
          name: 'Current Image',
          status: 'done',
          url: cilt.urlImgLayout,
        };
        setFileList([existingFile]);
      } else {
        // No image available
        setFileList([]);
      }
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
        {/* Standard time field removed - now calculated automatically in the database */}
        {/* Campo ciltDueDate agregado */}
        <Form.Item name="ciltDueDate" label={Strings.ciltDueDate} rules={[{ required: true, message: Strings.requiredDueDate }]}>
          <Input type="date" style={{ width: '100%' }} />
        </Form.Item>
        {/* Campo learnigTime eliminado del flujo */}
        <Form.Item name="status" label={Strings.ciltMstrStatusLabel} rules={[{ required: true, message: Strings.ciltMstrStatusRequired }]}>
          <Select placeholder={Strings.ciltMstrStatusPlaceholder}>
            <Option value={Constants.STATUS_ACTIVE}>{Strings.ciltMstrStatusActive}</Option>
            <Option value={Constants.STATUS_SUSPENDED}>{Strings.ciltMstrStatusSuspended}</Option>
            <Option value={Constants.STATUS_CANCELED}>{Strings.ciltMstrStatusCanceled}</Option>
          </Select>
        </Form.Item>
        
        <div className="flex flex-row gap-4">
          <Form.Item
            name="creatorName"
            label={Strings.ciltCreator}
            className="flex-1"
            rules={[
              { required: true, message: Strings.registerCiltCreatorRequiredValidation }
            ]}
          >
            <Input 
              size="large" 
              placeholder={Strings.selectCreator}
              readOnly
              addonAfter={
                <Button 
                  type="text" 
                  icon={<UserOutlined />} 
                  onClick={() => setCreatorModalVisible(true)}
                />
              }
            />
          </Form.Item>

          <Form.Item
            name="reviewerName"
            label={Strings.reviewer}
            className="flex-1"
            rules={[
              { required: true, message: Strings.registerCiltReviewerRequiredValidation }
            ]}
          >
            <Input 
              size="large" 
              placeholder={Strings.registerCiltReviewerPlaceholer}
              readOnly
              addonAfter={
                <Button 
                  type="text" 
                  icon={<UserOutlined />} 
                  onClick={() => setReviewerModalVisible(true)}
                />
              }
            />
          </Form.Item>

          <Form.Item
            name="approvedByName"
            label={Strings.approver}
            className="flex-1"
            rules={[
              { required: true, message: Strings.registerCiltApproverRequiredValidation }
            ]}
          >
            <Input 
              size="large" 
              placeholder={Strings.registerCiltApproverPlaceholer}
              readOnly
              addonAfter={
                <Button 
                  type="text" 
                  icon={<UserOutlined />} 
                  onClick={() => setApproverModalVisible(true)}
                />
              }
            />
          </Form.Item>
        </div>
        
        {/* Last updated date - read-only information field */}
        {cilt?.updatedAt && (
          <div className="mb-4">
            <Text type="secondary">{Strings.ciltMstrLastUpdated}</Text>
            <div className="mt-1 p-2 bg-gray-50 border rounded">
              <Text>{formatDate(cilt.updatedAt)}</Text>
            </div>
          </div>
        )}
        
        {/* Display a message when no image is selected */}
        {fileList.length === 0 && (
          <div className="mb-2 text-gray-500">{NO_IMAGE_TEXT}</div>
        )}
        
        {/* Separate the Form.Item from the Upload component to avoid warnings */}
        <Form.Item
          name="urlImgLayout"
          label={Strings.layoutImage}
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
          style={{ display: 'none' }} // Hide the actual form item
        >
          <Input type="hidden" />
        </Form.Item>
        
        {/* Upload component outside of Form.Item to avoid warnings */}
        <div className="mb-4">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            beforeUpload={() => false}
            maxCount={1}
            // Custom item render with our own delete button
            itemRender={(originNode, _file) => {
              return (
                <div className="relative group">
                  {originNode}
                  <div className="absolute top-1 right-1 z-10">
                    <Popconfirm
                      title="Are you sure you want to delete this image?"
                      onConfirm={() => {
                        // Clear the file list and firebase URL
                        setFileList([]);
                        // Also clear the form field value
                        form.setFieldsValue({ urlImgLayout: undefined });
                      }}
                      okText={Strings.yes || "Yes"}
                      cancelText={Strings.no || "No"}
                    >
                      <button 
                        type="button" 
                        className="flex items-center justify-center w-5 h-5 bg-white border border-gray-300 rounded-sm shadow-sm hover:bg-red-50 hover:border-red-300 focus:outline-none"
                        title="Delete image"
                      >
                        <DeleteOutlined className="text-gray-500 hover:text-red-500" style={{ fontSize: '12px' }} />
                      </button>
                    </Popconfirm>
                  </div>
                </div>
              );
            }}
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
        </div>
      </Form>

      <UserSelectionModal
        isVisible={creatorModalVisible}
        onCancel={() => setCreatorModalVisible(false)}
        onConfirm={handleCreatorSelection}
        users={responsibles}
        loading={loading}
        initialSelectedUserIds={creatorId ? [creatorId] : []}
        title={Strings.selectCreator}
        singleSelection={true}
      />

      <UserSelectionModal
        isVisible={reviewerModalVisible}
        onCancel={() => setReviewerModalVisible(false)}
        onConfirm={handleReviewerSelection}
        users={responsibles}
        loading={loading}
        initialSelectedUserIds={reviewerId ? [reviewerId] : []}
        title={Strings.selectReviewer}
        singleSelection={true}
      />

      <UserSelectionModal
        isVisible={approverModalVisible}
        onCancel={() => setApproverModalVisible(false)}
        onConfirm={handleApproverSelection}
        users={responsibles}
        loading={loading}
        initialSelectedUserIds={approvedById ? [approvedById] : []}
        title={Strings.selectApprover}
        singleSelection={true}
      />
    </Modal>
  );
};

export default CiltEditModal;