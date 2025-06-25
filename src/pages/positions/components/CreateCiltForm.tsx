import { Form, Input, Button, notification, Upload, UploadProps, Spin } from "antd";
import { useCreateCiltMstrMutation } from "../../../services/cilt/ciltMstrService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useEffect, useState } from "react";
import { Responsible } from "../../../data/user/user";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { handleUploadToFirebaseStorage } from "../../../config/firebaseUpload";
import UserSelectionModal from "../../components/UserSelectionModal";
import type { UploadFile, UploadFileStatus } from "antd/es/upload/interface";
import Strings from "../../../utils/localizations/Strings";
import { useLocation } from "react-router-dom";

interface FormProps {
  form: any;
  onSuccess?: () => void;
}

const CreateCiltForm = ({ form, onSuccess }: FormProps) => {
  const [createCiltMstr] = useCreateCiltMstrMutation();
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [reviewerId, setReviewerId] = useState<number | null>(null);
  const [approvedById, setApprovedById] = useState<number | null>(null);
  const [creatorModalVisible, setCreatorModalVisible] = useState(false);
  const [reviewerModalVisible, setReviewerModalVisible] = useState(false);
  const [approverModalVisible, setApproverModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [firebaseUrl, setFirebaseUrl] = useState<string>("");

  // Get siteId from location state
  const location = useLocation();
  const siteId = location.state?.siteId || "";

  useEffect(() => {
    if (siteId) {
      fetchResponsibles();
      // Reset form when component loads
      form.resetFields();
      setCreatorId(null);
      setReviewerId(null);
      setApprovedById(null);
      setFileList([]);
    }
  }, [siteId]); // Dependency on siteId instead of position

  const fetchResponsibles = async () => {
    if (!siteId) return;
    
    setLoading(true);
    try {
      const response = await getSiteResponsibles(siteId).unwrap();
      setResponsibles(response || []);
    } catch (error) {
      console.error("Error fetching responsibles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorSelection = (userIds: number[]) => {
    if (userIds.length > 0) {
      setCreatorId(userIds[0]);
      // Find the user by comparing with the same type
      const selectedUser = responsibles.find(user => Number(user.id) === userIds[0]);
      form.setFieldsValue({ creatorName: selectedUser?.name || "" });
    } else {
      setCreatorId(null);
      form.setFieldsValue({ creatorName: "" });
    }
  };

  const handleReviewerSelection = (userIds: number[]) => {
    if (userIds.length > 0) {
      setReviewerId(userIds[0]);
      // Find the user by comparing with the same type
      const selectedUser = responsibles.find(user => Number(user.id) === userIds[0]);
      form.setFieldsValue({ reviewerName: selectedUser?.name || "" });
    } else {
      setReviewerId(null);
      form.setFieldsValue({ reviewerName: "" });
    }
  };

  const handleApproverSelection = (userIds: number[]) => {
    if (userIds.length > 0) {
      setApprovedById(userIds[0]);
      // Find the user by comparing with the same type
      const selectedUser = responsibles.find(user => Number(user.id) === userIds[0]);
      form.setFieldsValue({ approvedByName: selectedUser?.name || "" });
    } else {
      setApprovedById(null);
      form.setFieldsValue({ approvedByName: "" });
    }
  };

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

    // Open the image in a new tab instead of using a preview modal
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
      setUploading(true);
      const sitePath = `site_${siteId}/cilt-procedures`;
      const url = await handleUploadToFirebaseStorage(
        sitePath, 
        {
          name: file.name,
          originFileObj: file
        },
        "jpg"
      );
      
      // Store the Firebase URL directly in state for later use
      setFirebaseUrl(url);
      
      // Update the file list with the uploaded file
      const newFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: "done" as UploadFileStatus,
        url: url,
      };
      setFileList([newFile]);
      
      onSuccess("Upload successful");
    } catch (error) {
      console.error("Error uploading image:", error);
      onError("Upload failed");
    } finally {
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

  const handleSubmit = async (values: any) => {
    // Use the stored Firebase URL
    if (!firebaseUrl) {
      notification.error({
        message: Strings.error,
        description: Strings.registerCiltLayoutImageRequiredValidation,
        duration: 4,
      });
      return;
    }

    // Construct the payload - using direct object literal to match backend requirements
    // Using 'as any' to bypass TypeScript type checking since the backend API has different requirements
    // than our frontend model (backend rejects dateOfLastUsed property)
    const ciltPayload = {
      siteId: Number(siteId),
      ciltName: values.ciltName,
      ciltDescription: values.ciltDescription,
      creatorId: creatorId ? Number(creatorId) : 0,
      creatorName: values.creatorName || "",
      reviewerId: reviewerId ? Number(reviewerId) : 0,
      reviewerName: values.reviewerName || "",
      approvedById: approvedById ? Number(approvedById) : 0,
      approvedByName: values.approvedByName || "",
      standardTime: undefined, 
      urlImgLayout: firebaseUrl, 
      order: 1, 
      status: "A", 
      ciltDueDate: values.ciltDueDate ? `${values.ciltDueDate}T00:00:00.000Z` : undefined
      // dateOfLastUsed and createdAt removed as backend rejects them
    } as any;
    
    try {
      // Make the API call to create the CILT procedure
      const result = await createCiltMstr(ciltPayload).unwrap();
      console.log('CILT Mstr created successfully:', result);
      
      // Show only one success notification with appropriate message
      notification.success({
        message: Strings.success,
        description: Strings.ciltMasterCreateSuccess,
        duration: 4,
      });
      
      // Reset form fields
      form.resetFields();
      setCreatorId(null);
      setReviewerId(null);
      setApprovedById(null);
      setFileList([]);
      setFirebaseUrl('');
      
      // Call onSuccess callback to trigger data refresh in parent component
      if (onSuccess) {
        // Call onSuccess immediately
        onSuccess();
        
        // Call it again after a short delay to ensure data is refreshed
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (error: any) {
      console.error(Strings.ciltMasterCreateError, error);
      // Show error notification
      notification.error({
        message: Strings.error,
        description: `${Strings.ciltMasterCreateError}: ${error.data?.message || "Unknown error"}`,
        duration: 6,
      });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="flex flex-col gap-4 w-full"
      onFinish={handleSubmit}
      preserve={false}
    >
      <Form.Item
        name="ciltName"
        label={Strings.ciltName}
        rules={[
          { required: true, message: Strings.registerCiltNameRequiredValidation },
          { max: 100, message: Strings.registerCiltNameMaxLengthValidation }
        ]}
      >
        <Input 
          size="large" 
          placeholder={Strings.registerCiltNamePlaceholer} 
          maxLength={100}
          showCount
          className="w-full border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </Form.Item>

      <Form.Item
        name="ciltDescription"
        label={Strings.ciltDescription}
        rules={[
          { required: true, message: Strings.registerCiltDescriptionRequiredValidation },
          { max: 500, message: Strings.registerCiltDescriptionMaxLengthValidation }
        ]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder={Strings.registerCiltDescriptionPlaceholer} 
          maxLength={500}
          showCount
          className="w-full border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </Form.Item>

      <div className="flex flex-row gap-4">
        {/* Standard time field removed - now calculated automatically in the database */}
        <Form.Item
          name="ciltDueDate"
          label={Strings.ciltDueDate}
          className="flex-1"
          rules={[
            { required: true, message: Strings.requiredDueDate }
          ]}
        >
          <Input 
            size="large" 
            type="date"
            className="w-full border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Form.Item
          name="creatorName"
          label={Strings.ciltCreator}
          className="mb-0"
          rules={[
            { required: true, message: Strings.registerCiltCreatorRequiredValidation }
          ]}
        >
          <div className="flex items-center">
            <Input 
              className="flex-1 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={Strings.selectCreator}
              readOnly
              value={creatorId ? responsibles.find(user => Number(user.id) === creatorId)?.name || "" : ""}
            />
            <Button 
              type="primary"
              icon={<UserOutlined />} 
              onClick={() => setCreatorModalVisible(true)}
              className="ml-2"
            >
              {Strings.select}
            </Button>
          </div>
        </Form.Item>

        <Form.Item
          name="reviewerName"
          label={Strings.reviewer}
          className="mb-0"
          rules={[
            { required: true, message: Strings.registerCiltReviewerRequiredValidation }
          ]}
        >
          <div className="flex items-center">
            <Input 
              className="flex-1 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={Strings.registerCiltReviewerPlaceholer}
              readOnly
              value={reviewerId ? responsibles.find(user => Number(user.id) === reviewerId)?.name || "" : ""}
            />
            <Button 
              type="primary"
              icon={<UserOutlined />} 
              onClick={() => setReviewerModalVisible(true)}
              className="ml-2"
            >
              {Strings.select}
            </Button>
          </div>
        </Form.Item>
        
        <Form.Item
          name="approvedByName"
          label={Strings.approver}
          className="mb-0"
          rules={[
            { required: true, message: Strings.registerCiltApproverRequiredValidation }
          ]}
        >
          <div className="flex items-center">
            <Input 
              className="flex-1 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={Strings.registerCiltApproverPlaceholer}
              readOnly
              value={approvedById ? responsibles.find(user => Number(user.id) === approvedById)?.name || "" : ""}
            />
            <Button 
              type="primary"
              icon={<UserOutlined />} 
              onClick={() => setApproverModalVisible(true)}
              className="ml-2"
            >
              {Strings.select}
            </Button>
          </div>
        </Form.Item>
      </div>

      <Form.Item
        name="urlImgLayout"
        label={Strings.layoutImage}
        rules={[
          { required: true, message: Strings.registerCiltLayoutImageRequiredValidation }
        ]}
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          customRequest={customUpload}
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
          className="border-gray-300 p-2 rounded-md"
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
      </Form.Item>

      <div className="flex justify-end mt-4">
        <Button 
          type="primary" 
          htmlType="submit"
          size="large"
          className="px-6 py-2 h-auto font-medium"
        >
          {Strings.save}
        </Button>
      </div>

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
    </Form>
  );
};

export default CreateCiltForm;
