import { Form, Input, Button, Modal, Select, notification, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useUpdatePositionMutation } from "../../../services/positionService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useGetPositionUsersQuery } from "../../../services/positionService";
import { Position } from "../../../data/postiions/positions";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import UserSelectionModal from "../../../components/UserSelectionModal";
import { UserOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

interface FormProps {
  form: any;
  position?: Position | null;
  isVisible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const UpdatePositionForm = ({ form, position, isVisible, onCancel, onSuccess }: FormProps) => {
  const [updatePosition] = useUpdatePositionMutation();
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();
  const { data: positionUsers = [] } = useGetPositionUsersQuery(
    position?.id ? position.id.toString() : '', 
    { skip: !position?.id }
  );
  
  const [users, setUsers] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userModalVisible, setUserModalVisible] = useState(false);

  // Load site users when the form becomes visible
  useEffect(() => {
    const fetchUsers = async () => {
      if (position?.siteId && isVisible) {
        setLoading(true);
        try {
          const responsibles = await getSiteResponsibles(String(position.siteId)).unwrap();
          setUsers(responsibles);
        } catch (error) {
          // Error handling without logging
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [position, isVisible, getSiteResponsibles]);

  // Set initially selected users based on position users
  useEffect(() => {
    if (positionUsers.length > 0) {
      const userIds = positionUsers.map(user => user.id);
      setSelectedUsers(userIds);
    }
  }, [positionUsers]);

  const handleUserSelect = (userIds: number[]) => {
    setSelectedUsers(userIds.map(id => id.toString()));
  };

  const handleSubmit = async (values: any) => {
    if (!position) {
      notification.error({
        message: Strings.error,
        description: Strings.noPositionData,
        duration: 4,
      });
      return;
    }

    // Construct the payload based on the example and available data
    const positionPayload = {
      ...position,
      name: values.name,
      description: values.description,
      status: values.status,
      userIds: selectedUsers.map(id => parseInt(id, 10))
    };

    try {
      await updatePosition(positionPayload).unwrap();
      
      notification.success({
        message: Strings.success,
        description: Strings.positionUpdatedSuccess,
        duration: 4,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      notification.error({
        message: Strings.error,
        description: Strings.positionUpdateError,
        duration: 6,
      });
    }
  };

  // Helper function to determine the initial status value
  const getInitialStatus = (status: string | undefined) => {
    if (!status) return Constants.STATUS_ACTIVE;
    
    // Normalize status values
    if (status === Constants.STATUS_ACTIVE) return Constants.STATUS_ACTIVE;
    if (status === Constants.STATUS_SUSPENDED) return Constants.STATUS_SUSPENDED;
    if (status === Constants.STATUS_CANCELED) return Constants.STATUS_CANCELED;
    
    return Constants.STATUS_ACTIVE; // Default to active if unknown
  };

  return (
    <Modal
      title={Strings.updatePositionTitle + (position?.name ? ': ' + position.name : '')}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: position?.name || '',
          description: position?.description || '',
          status: getInitialStatus(position?.status),
        }}
        preserve={false}
      >
        <Form.Item
          name="name"
          label={Strings.positionNameHeader}
          rules={[
            {
              required: true,
              message: Strings.requiredInfo,
            },
            {
              max: 45,
              message: Strings.positionNameMaxLength,
            },
          ]}
        >
          <Input 
            placeholder={Strings.positionNameHeader}
            maxLength={45}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={Strings.positionDescriptionHeader}
          rules={[
            {
              max: 100,
              message: Strings.positionDescriptionMaxLength,
            },
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder={Strings.positionDescriptionHeader}
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={Strings.positionStatusHeader}
          rules={[
            {
              required: true,
              message: Strings.pleaseSelectStatus,
            },
          ]}
        >
          <Select placeholder={Strings.selectStatus}>
            <Option value={Constants.STATUS_ACTIVE}>{Strings.active}</Option>
            <Option value={Constants.STATUS_SUSPENDED}>{Strings.suspended}</Option>
            <Option value={Constants.STATUS_CANCELED}>{Strings.canceled}</Option>
          </Select>
        </Form.Item>

        <div className="mb-4">
          <Text strong>{Strings.assignedUsers}</Text>
          {loading ? (
            <Spin tip={Strings.loadingPositions} />
          ) : (
            <div className="mt-2">
              <Button 
                type="dashed" 
                icon={<UserOutlined />} 
                onClick={() => setUserModalVisible(true)}
                className="w-full"
              >
                {Strings.selectUsersForPosition}
              </Button>
              
              {selectedUsers.length > 0 ? (
                <div className="mt-2">
                  <Text strong>{Strings.selectedUsers}: {selectedUsers.length}</Text>
                </div>
              ) : (
                <Text type="secondary" className="block mt-2">{Strings.noUsersSelected}</Text>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>{Strings.cancel}</Button>
          <Button type="primary" htmlType="submit">
            {Strings.save}
          </Button>
        </div>
      </Form>
      
      <UserSelectionModal
        isVisible={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        onConfirm={handleUserSelect}
        users={users}
        loading={loading}
        initialSelectedUserIds={selectedUsers.map(id => Number(id))}
        title={Strings.assignedUsers}
      />
    </Modal>
  );
};

export default UpdatePositionForm;
