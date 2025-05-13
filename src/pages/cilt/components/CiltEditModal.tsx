import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Alert, Select, Upload, Spin, notification, Typography, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadFileStatus, UploadProps } from 'antd/es/upload/interface';
import { handleUploadToFirebaseStorage } from '../../../config/firebaseUpload';
import { CiltMstr, UpdateCiltMstrDTO } from '../../../data/cilt/ciltMstr/ciltMstr';
import { useUpdateCiltMstrMutation } from '../../../services/cilt/ciltMstrService';
import Constants from '../../../utils/Constants';
import Strings from '../../../utils/localizations/Strings';

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
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [firebaseUrl, setFirebaseUrl] = useState<string | undefined>(undefined);

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

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      // Set uploading state to show spinner
      setUploading(true);
      
      // Generate a unique filename with timestamp
      const timestamp = new Date().getTime();
      const fileName = `cilt_${timestamp}`;
      
      // Upload the file to Firebase storage
      const url = await handleUploadToFirebaseStorage(
        "cilt", 
        {
          name: fileName,
          originFileObj: file
        },
        "jpg"
      );
      
      // Store the Firebase URL directly in state for later use
      setFirebaseUrl(url);
      
      // Update the form field value to ensure it's included in form submission
      form.setFieldsValue({ urlImgLayout: url });
      
      // Update the file list with the uploaded file
      const newFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: "done" as UploadFileStatus,
        url: url,
      };
      
      // Set the file list with the new file
      setFileList([newFile]);
      
      // Signal success to the Upload component
      onSuccess("Upload successful");
      
      // Show success notification
      notification.success({
        message: Strings.success,
        description: Strings.imageLoadSuccess,
        duration: 2,
      });
    } catch (error) {
      
      // Signal error to the Upload component
      onError("Upload failed");
      
      // Show error notification
      notification.error({
        message: Strings.error,
        description: Strings.imageUploadError,
        duration: 4,
      });
      
      // Clear the file list in case of error
      setFileList([]);
    } finally {
      // Always reset uploading state when done
      setUploading(false);
    }
  };

  // Upload button
  const uploadButton = (
    <div>
      {uploading ? <Spin /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (cilt) {
        const dateOfLastUsed = cilt.dateOfLastUsed || new Date().toISOString();
        const updatedAt = new Date().toISOString();

        // Get the image URL from the form values or use the existing one
        let imageUrl = values.urlImgLayout;
        
        // If no URL in form values, try to get it from fileList or firebaseUrl
        if (!imageUrl) {
          imageUrl = firebaseUrl || (fileList.length > 0 && fileList[0].url) || cilt.urlImgLayout || undefined;
        }

        // Log the image URL for debugging
        
        // Ensure we have an image URL
        if (!imageUrl && fileList.length === 0) {
          notification.warning({
            message: "Warning",
            description: "Please upload a layout image or cancel the edit.",
            duration: 4,
          });
          return;
        }
        
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
          undefined, // Removing learnigTime from the flow as requested
          imageUrl, // Using the properly determined image URL
          cilt.order ?? undefined,
          values.status
        );
        
        // Submit the update
        await updateCiltMstr(updatedData).unwrap();
        
        // Show success notification
        notification.success({
          message: Strings.success,
          description: Strings.ciltMstrUpdateSuccess || 'CILT actualizado correctamente',
        });
        
        onSuccess();
      }
    } catch (err: any) {
      console.error('Failed to update CILT:', err);
      setUpdateError(err.data?.message || err.message || Strings.ciltMstrUpdateError);
    }
  };

  const handleCancel = () => {
    setUpdateError(null);
    setFileList([]);
    setFirebaseUrl(undefined);
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
        standardTime: cilt.standardTime,
        status: cilt.status,
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
        <Form.Item name="standardTime" label={Strings.ciltMstrStandardTimeLabel} rules={[{ type: 'number', message: Strings.ciltMstrInvalidNumberMessage }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        {/* Campo learnigTime eliminado del flujo */}
        <Form.Item name="status" label={Strings.ciltMstrStatusLabel} rules={[{ required: true, message: Strings.ciltMstrStatusRequired }]}>
          <Select placeholder={Strings.ciltMstrStatusPlaceholder}>
            <Option value={Constants.STATUS_ACTIVE}>{Strings.ciltMstrStatusActive}</Option>
            <Option value={Constants.STATUS_SUSPENDED}>{Strings.ciltMstrStatusSuspended}</Option>
            <Option value={Constants.STATUS_CANCELED}>{Strings.ciltMstrStatusCanceled}</Option>
          </Select>
        </Form.Item>
        
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
            onChange={(info) => {
              handleChange(info);
              // Update the form field value when the file list changes
              if (info.fileList.length > 0 && info.fileList[0].status === 'done' && info.fileList[0].url) {
                form.setFieldsValue({ urlImgLayout: info.fileList[0].url });
              } else {
                form.setFieldsValue({ urlImgLayout: undefined });
              }
            }}
            customRequest={customUpload}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: false, // Hide the default remove icon
              showDownloadIcon: false
            }}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                notification.error({
                  message: Strings.error,
                  description: Strings.imageUploadError,
                });
              }
              return isImage || Upload.LIST_IGNORE;
            }}
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
                        setFirebaseUrl(undefined);
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
    </Modal>
  );
};

export default CiltEditModal;