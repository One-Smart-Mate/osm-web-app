import { Form, Input, Button, notification, Upload, UploadProps, Spin } from "antd";
import { useCreateCiltMstrMutation } from "../../../services/cilt/ciltMstrService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useEffect, useState } from "react";
import { Responsible } from "../../../data/user/user";
import { UserOutlined, ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Position } from "../../../data/postiions/positions";
import { CreateCiltMstrDTO } from "../../../data/cilt/ciltMstr/ciltMstr";
import { handleUploadToFirebaseStorage } from "../../../config/firebaseUpload";
import UserSelectionModal from "../../../components/UserSelectionModal";
import type { UploadFile, UploadFileStatus } from "antd/es/upload/interface";
import Strings from "../../../utils/localizations/Strings";

interface FormProps {
  form: any;
  position: Position | null;
  onSuccess?: () => void;
}

const CreateCiltForm = ({ form, position, onSuccess }: FormProps) => {
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

  useEffect(() => {
    if (position?.siteId) {
      fetchResponsibles();
      // Reset form when position changes
      form.resetFields();
      setCreatorId(null);
      setReviewerId(null);
      setApprovedById(null);
      setFileList([]);
    }
  }, [position]);

  const fetchResponsibles = async () => {
    if (!position?.siteId) return;
    
    setLoading(true);
    try {
      // Convert siteId to string and ensure it's a valid value
      const siteIdString = String(position.siteId);
      
      const response = await getSiteResponsibles(siteIdString).unwrap();
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
      // Upload the file to Firebase storage
      const url = await handleUploadToFirebaseStorage(
        "cilt", 
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
    if (!position) {
      return;
    }

    // Use the stored Firebase URL
    if (!firebaseUrl) {
      notification.error({
        message: "Error",
        description: "Please upload a layout image",
        duration: 4,
      });
      return;
    }

    // Construct the payload
    const ciltPayload: CreateCiltMstrDTO = {
      siteId: Number(position.siteId),
      positionId: Number(position.id),
      ciltName: values.ciltName,
      ciltDescription: values.ciltDescription,
      creatorId: creatorId ? Number(creatorId) : 0,
      creatorName: values.creatorName || "",
      reviewerId: reviewerId ? Number(reviewerId) : 0,
      reviewerName: values.reviewerName || "",
      approvedById: approvedById ? Number(approvedById) : 0,
      approvedByName: values.approvedByName || "",
      standardTime: Number(values.standardTime) || 0,
      learnigTime: undefined, // Campo eliminado del flujo
      urlImgLayout: firebaseUrl, // Use the stored Firebase URL
      order: 1, // Default order
      status: "A", // Default status is Active
      dateOfLastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    try {
      // Make the API call to create the CILT procedure
      await createCiltMstr(ciltPayload).unwrap();
      
      // Show success notification
      notification.success({
        message: Strings.success,
        description: Strings.ciltMasterCreateSuccess,
        duration: 4,
      });
      
      if (onSuccess) {
        onSuccess();
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
        />
      </Form.Item>

      <div className="flex flex-row gap-4">
        <Form.Item
          name="standardTime"
          label={Strings.standardTime}
          className="flex-1"
          rules={[
            { required: true, message: Strings.registerCiltStandardTimeRequiredValidation }
          ]}
        >
          <Input 
            size="large" 
            type="number"
            min={0}
            addonBefore={<ClockCircleOutlined />}
            placeholder={Strings.registerCiltStandardTimePlaceholer} 
          />
        </Form.Item>

        {/* Campo learnigTime eliminado del flujo */}
      </div>

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
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
      </Form.Item>

      <div className="flex justify-end space-x-2 mt-4">
        <Button type="primary" htmlType="submit">
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
