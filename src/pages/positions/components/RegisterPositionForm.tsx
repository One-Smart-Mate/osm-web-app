import { Form, Input, Button, Modal, Spin, notification } from "antd";
import { useCreatePositionMutation } from "../../../services/positionService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useEffect, useState } from "react";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import UserSelectionModal from "../../components/UserSelectionModal";
import { UserOutlined } from "@ant-design/icons";

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
  const [selectedUsers, setSelectedUsers] = useState<Responsible[]>([]);
  const [userModalVisible, setUserModalVisible] = useState(false);

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

  const handleUserSelection = (userIds: number[]) => {
    setSelectedUserIds(userIds);
    // Update the selected users list with their details
    const selected = responsibles.filter(user => userIds.includes(Number(user.id)));
    setSelectedUsers(selected);
  };

  const handleSubmit = async (values: any) => {
    if (!levelData) {
      return;
    }

    // Construct the payload based on the example and available data
    const positionPayload = {
      siteId: Number(levelData.siteId), 
      siteName: levelData.siteName,
      siteType: levelData.siteType || "", // Default if not available
      areaId: null, // Backend will generate this automatically
      areaName: null, // Backend will generate this automatically
      levelId: levelData.id ? Number(levelData.id) : null,
      levelName: levelData.name || null,
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
      destroyOnHidden
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
            ) : (
              <div>
                <Button 
                  onClick={() => setUserModalVisible(true)}
                  icon={<UserOutlined />}
                  className="mb-2"
                >
                  {Strings.selectUsers} ({selectedUserIds.length})
                </Button>
                
                {selectedUserIds.length === 0 && (
                  <div className="text-gray-500">{Strings.noUsersSelected}</div>
                )}
                
                {selectedUserIds.length > 0 && (
                  <div className="mt-2">
                    <div className="mt-1 p-2 border rounded-md max-h-32 overflow-y-auto">
                      {selectedUsers.map(user => (
                        <div key={user.id} className="py-1 border-b last:border-b-0">
                          {user.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
      
      <UserSelectionModal
        isVisible={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        onConfirm={handleUserSelection}
        users={responsibles}
        loading={loading}
        initialSelectedUserIds={selectedUserIds}
      />
    </Modal>
  );
};

export default RegisterPositionForm;
