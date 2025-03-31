import { Form, Input, Button, Modal, Select, notification, Checkbox, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdatePositionMutation } from "../../../services/positionService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useGetPositionUsersQuery } from "../../../services/positionService";
import { Position } from "../../../data/postiions/positions";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";

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
  const { t } = useTranslation();
  const [updatePosition] = useUpdatePositionMutation();
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();
  const { data: positionUsers = [] } = useGetPositionUsersQuery(
    position?.id ? position.id.toString() : '', 
    { skip: !position?.id }
  );
  
  const [users, setUsers] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSubmit = async (values: any) => {
    if (!position) {
      notification.error({
        message: t(Strings.error),
        description: t(Strings.noPositionData),
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
        message: t(Strings.success),
        description: t(Strings.positionUpdatedSuccess),
        duration: 4,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      notification.error({
        message: t(Strings.error),
        description: t(Strings.positionUpdateError),
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
      title={t(Strings.updatePositionTitle, { name: position?.name || '' })}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
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
          label={t(Strings.positionNameHeader)}
          rules={[
            {
              required: true,
              message: t(Strings.requiredInfo),
            },
            {
              max: 45,
              message: t(Strings.positionNameMaxLength),
            },
          ]}
        >
          <Input 
            placeholder={t(Strings.positionNameHeader)}
            maxLength={45}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t(Strings.positionDescriptionHeader)}
          rules={[
            {
              max: 100,
              message: t(Strings.positionDescriptionMaxLength),
            },
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder={t(Strings.positionDescriptionHeader)}
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={t(Strings.positionStatusHeader)}
          rules={[
            {
              required: true,
              message: t(Strings.pleaseSelectStatus),
            },
          ]}
        >
          <Select placeholder={t(Strings.selectStatus)}>
            <Option value={Constants.STATUS_ACTIVE}>{t(Strings.active)}</Option>
            <Option value={Constants.STATUS_SUSPENDED}>{t(Strings.suspended)}</Option>
            <Option value={Constants.STATUS_CANCELED}>{t(Strings.canceled)}</Option>
          </Select>
        </Form.Item>

        <div className="mb-4">
          <Text strong>{t(Strings.assignedUsers)}</Text>
          {loading ? (
            <Spin tip={t(Strings.loadingPositions)} />
          ) : users.length === 0 ? (
            <Text type="secondary" className="block mt-2">{t(Strings.noAssignedUsers)}</Text>
          ) : (
            <div className="mt-2 border p-4 rounded-md max-h-40 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="mb-2">
                  <Checkbox 
                    onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                    checked={selectedUsers.includes(user.id)}
                  >
                    <span className="font-medium">{user.name}</span>
                  </Checkbox>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>{t(Strings.cancel)}</Button>
          <Button type="primary" htmlType="submit">
            {t(Strings.save)}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdatePositionForm;
