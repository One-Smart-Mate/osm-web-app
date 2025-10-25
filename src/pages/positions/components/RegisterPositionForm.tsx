import { Form, Input, Button, Modal, Spin, notification, Select } from "antd";
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

const RegisterPositionForm = ({
  form,
  levelData,
  isVisible,
  onCancel,
  onSuccess,
}: FormProps) => {
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
      // Clear selected users when modal opens (new position creation)
      setSelectedUserIds([]);
      setSelectedUsers([]);
    }
  }, [isVisible, levelData]);

  const fetchResponsibles = async () => {
    if (!levelData?.siteId) return;

    setLoading(true);
    try {
      const siteIdString = String(levelData.siteId);
      console.log("Fetching responsibles for site:", siteIdString);

      const response = await getSiteResponsibles(siteIdString).unwrap();
      console.log("Responsibles loaded:", response);
      setResponsibles(response || []);
    } catch (error) {
      console.error("Error fetching responsibles:", error);
      notification.error({
        message: Strings.error,
        description: `${Strings.error} ${Strings.loading.toLowerCase()}.`,
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userIds: number[]) => {
    setSelectedUserIds(userIds);

    const selected = responsibles.filter((user) =>
      userIds.includes(Number(user.id))
    );
    setSelectedUsers(selected);
  };

  const handleSubmit = async (values: any) => {
    if (!levelData) {
      return;
    }

    const nodeResponsable = responsibles.find(
      (resp) => resp.id === values.nodeResponsableId
    );

    const positionPayload = {
      siteId: Number(levelData.siteId),
      siteName: levelData.siteName,
      siteType: levelData.siteType || "",
      areaId: levelData.areaId ? Number(levelData.areaId) : null,
      areaName: levelData.areaName || null,
      levelId: levelData.id ? Number(levelData.id) : null,
      levelName: levelData.name || null,
      route: levelData.levelLocation || "/",
      order: 1,
      name: values.name,
      description: values.description,
      status: "A",
      nodeResponsableId: values.nodeResponsableId
        ? Number(values.nodeResponsableId)
        : null,
      nodeResponsableName: nodeResponsable ? nodeResponsable.name : null,
      userIds: selectedUserIds,
      createdAt: new Date().toISOString(),
    };

    try {
      await createPosition(positionPayload).unwrap();

      notification.success({
        message: Strings.success,
        description: `${
          values.name
        } ${Strings.createPosition.toLowerCase()} ${Strings.success.toLowerCase()}.`,
        duration: 4,
      });

      // Clear selected users after successful creation
      setSelectedUserIds([]);
      setSelectedUsers([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (_error) {
      notification.error({
        message: Strings.error,
        description: `${
          Strings.error
        } ${Strings.createPosition.toLowerCase()}.`,
        duration: 6,
      });
    }
  };

  const handleCancel = () => {
    // Clear selected users when modal is canceled
    setSelectedUserIds([]);
    setSelectedUsers([]);
    onCancel();
  };

  return (
    <Modal
      title={Strings.createPosition}
      open={isVisible}
      onCancel={handleCancel}
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
              { max: 45, message: `${Strings.name} ${Strings.passwordLenght}` },
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
              {
                max: 100,
                message: `${Strings.description} ${Strings.passwordLenght}`,
              },
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
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="py-1 border-b last:border-b-0"
                        >
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
            <Button onClick={handleCancel}>{Strings.cancelPosition}</Button>
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
