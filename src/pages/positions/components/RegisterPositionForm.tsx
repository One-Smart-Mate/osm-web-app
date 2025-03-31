import { Form, Input, Button, Modal, Checkbox, Spin, notification } from "antd";
import { useCreatePositionMutation } from "../../../services/positionService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useEffect, useState } from "react";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";

interface FormProps {
  form: any;
  levelData?: any;
  isVisible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const RegisterPositionForm = ({ form, levelData, isVisible, onCancel, onSuccess }: FormProps) => {
  const [createPosition] = useCreatePositionMutation();
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  useEffect(() => {
    if (isVisible && levelData?.siteId) {
      fetchResponsibles();
    }
  }, [isVisible, levelData]);

  const fetchResponsibles = async () => {
    if (!levelData?.siteId) return;
    
    setLoading(true);
    try {
      // Convert siteId to string and ensure it's a valid value
      const siteIdString = String(levelData.siteId);
      
      const response = await getSiteResponsibles(siteIdString).unwrap();
      setResponsibles(response || []);
    } catch (error) {
      // Error handling without logging
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSubmit = async (values: any) => {
    if (!levelData) {
      return;
    }

    // Construct the payload based on the example and available data
    const positionPayload = {
      siteId: Number(levelData.siteId),
      siteName: levelData.siteName,
      siteType: levelData.siteType || "Headquarters", // Default if not available
      areaId: null, // Backend will generate this automatically
      areaName: null, // Backend will generate this automatically
      levelId: Number(levelData.id),
      levelName: levelData.name,
      route: levelData.levelLocation || null,
      name: values.name,
      description: values.description,
      status: "A",
      userIds: selectedUserIds
    };
    
    try {
      // Make the API call to create the position
      await createPosition(positionPayload).unwrap();
      
      // Show success notification
      notification.success({
        message: Strings.success,
        description: `${values.name} ${Strings.createPosition.toLowerCase()} ${Strings.success.toLowerCase()}.`,
        duration: 4,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Show error notification
      notification.error({
        message: Strings.error,
        description: `${Strings.error} ${Strings.createPosition.toLowerCase()}.`,
        duration: 6,
      });
    }
  };

  return (
    <Modal
      title={Strings.createPosition}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="p-4">
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col gap-4 w-full"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            name="name"
            label={Strings.name}
            rules={[
              { required: true, message: Strings.requiredInfo },
              { max: 45, message: `${Strings.name} ${Strings.passwordLenght}` }
            ]}
          >
            <Input 
              size="large" 
              placeholder={Strings.positionName} 
              maxLength={45}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={Strings.description}
            rules={[
              { required: false },
              { max: 100, message: `${Strings.description} ${Strings.passwordLenght}` }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder={Strings.positionDescription} 
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Form.Item
            label={Strings.assignedUsers}
            help={Strings.selectUsersForPosition}
          >
            {loading ? (
              <Spin size="small" />
            ) : responsibles.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {responsibles.map(user => (
                  <div key={user.id} className="py-1 border-b last:border-b-0">
                    <Checkbox 
                      onChange={(e) => handleUserSelection(Number(user.id), e.target.checked)}
                    >
                      <span className="font-medium">{user.name}</span>
                    </Checkbox>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">{Strings.noUsersAvailableForSite}</div>
            )}
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={onCancel}>
              {Strings.cancelPosition}
            </Button>
            <Button type="primary" htmlType="submit">
              {Strings.save}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default RegisterPositionForm;
