import {
  Form,
  Input,
  Button,
  Modal,
  Select,
  notification,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useUpdatePositionMutation } from "../../../services/positionService";
import { useGetSiteResponsiblesMutation } from "../../../services/userService";
import { useGetPositionUsersQuery } from "../../../services/positionService";
import { Position } from "../../../data/postiions/positions";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";
import Constants from "../../../utils/Constants";
import UserSelectionModal from "../../components/UserSelectionModal";
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

const UpdatePositionForm = ({
  form,
  position,
  isVisible,
  onCancel,
  onSuccess,
}: FormProps) => {
  const [updatePosition] = useUpdatePositionMutation();
  const [getSiteResponsibles] = useGetSiteResponsiblesMutation();
  const { data: positionUsers = [] } = useGetPositionUsersQuery(
    position?.id ? position.id.toString() : "",
    { skip: !position?.id }
  );

  const [users, setUsers] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState<Responsible[]>(
    []
  );
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (position?.siteId && isVisible) {
        setLoading(true);
        try {
          const fetchedResponsibles = await getSiteResponsibles(
            String(position.siteId)
          ).unwrap();
          setUsers(fetchedResponsibles);
          setResponsibles(fetchedResponsibles);
        } catch (_error) {
          console.error("Error fetching responsibles:", _error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [position, isVisible, getSiteResponsibles]);

  useEffect(() => {
    if (positionUsers.length > 0) {
      const userIds = positionUsers.map((user) => user.id);
      setSelectedUsers(userIds);
      setSelectedUserDetails(positionUsers);
    }
  }, [positionUsers]);

  const handleUserSelect = (userIds: number[]) => {
    setSelectedUsers(userIds.map((id) => id.toString()));

    const selected = users.filter((user) => userIds.includes(Number(user.id)));
    setSelectedUserDetails(selected);
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

    const nodeResponsable = responsibles.find(
      (resp) => resp.id === values.nodeResponsableId
    );

    const positionPayload = {
      id: position.id,
      siteId: position.siteId,
      siteName: position.siteName,
      siteType: position.siteType,
      areaId: position.areaId,
      areaName: position.areaName,
      levelId: position.levelId,
      levelName: position.levelName,
      route: position.route,
      name: values.name,
      description: values.description,
      status: values.status,
      nodeResponsableId: values.nodeResponsableId
        ? Number(values.nodeResponsableId)
        : position.nodeResponsableId,
      nodeResponsableName: nodeResponsable
        ? nodeResponsable.name
        : position.nodeResponsableName,
      userIds: selectedUsers.map((id) => parseInt(id, 10)),
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
    } catch (_error) {
      notification.error({
        message: Strings.error,
        description: Strings.positionUpdateError,
        duration: 6,
      });
    }
  };

  const getInitialStatus = (status: string | undefined) => {
    if (!status) return Constants.STATUS_ACTIVE;

    if (status === Constants.STATUS_ACTIVE) return Constants.STATUS_ACTIVE;
    if (status === Constants.STATUS_SUSPENDED)
      return Constants.STATUS_SUSPENDED;
    if (status === Constants.STATUS_CANCELED) return Constants.STATUS_CANCELED;

    return Constants.STATUS_ACTIVE;
  };

  return (
    <Modal
      title={
        Strings.updatePositionTitle +
        (position?.name ? ": " + position.name : "")
      }
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
          name: position?.name || "",
          description: position?.description || "",
          status: getInitialStatus(position?.status),
          nodeResponsableId: position?.nodeResponsableId || undefined,
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
            <Option value={Constants.STATUS_SUSPENDED}>
              {Strings.suspended}
            </Option>
            <Option value={Constants.STATUS_CANCELED}>
              {Strings.canceled}
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="nodeResponsableId"
          label={Strings.nodeResponsable || "Node Responsible"}
          rules={[{ required: true, message: Strings.requiredInfo }]}
        >
          <Select
            placeholder={Strings.selectResponsable || "Select Responsible"}
            loading={loading}
            showSearch
            optionFilterProp="children"
            filterOption={(input: string, option: any) => {
              if (!option || !option.children) return false;
              return (
                option.children
                  .toString()
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              );
            }}
          >
            {responsibles.map((responsible) => (
              <Select.Option key={responsible.id} value={responsible.id}>
                {responsible.name}
              </Select.Option>
            ))}
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
                  <Text strong>
                    {Strings.selectedUsers} ({selectedUsers.length})
                  </Text>
                  <div className="mt-1 p-2 border rounded-md max-h-32 overflow-y-auto">
                    {selectedUserDetails.map((user) => (
                      <div
                        key={user.id}
                        className="py-1 border-b last:border-b-0"
                      >
                        {user.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Text type="secondary" className="block mt-2">
                  {Strings.noUsersSelected}
                </Text>
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
        initialSelectedUserIds={selectedUsers.map((id) => Number(id))}
        title={Strings.assignedUsers}
      />
    </Modal>
  );
};

export default UpdatePositionForm;
