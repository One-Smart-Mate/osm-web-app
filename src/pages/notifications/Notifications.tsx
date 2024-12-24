import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select, Checkbox, Button } from "antd";
import Strings from "../../utils/localizations/Strings";
import { useGetSitesMutation } from "../../services/siteService";
import { useGetSiteUsersMutation, useSendCustomNotificationMutation } from "../../services/userService";

const { TextArea } = Input;

const Notifications: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<{ id: number; name: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const [getSites] = useGetSitesMutation();
  const [getSiteUsers] = useGetSiteUsersMutation();
  const [sendCustomNotification] = useSendCustomNotificationMutation();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchSites = async () => {
      const response = await getSites().unwrap();
      setSites(response.map((site) => ({ id: site.id, name: site.name })));
    };
    fetchSites();
  }, [getSites]);

  const handleSiteChange = async (siteId: string) => {
    setSelectedSite(siteId);
    const response = await getSiteUsers(siteId).unwrap();
    const userList = response.map((user) => ({ id: Number(user.id), name: user.name }));
    setUsers(userList);
    setFilteredUsers(userList);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredUsers(users.filter((user) => user.name.toLowerCase().includes(searchValue)));
  };

  const handleUserSelection = (checkedValues: number[]) => {
    setSelectedUsers(checkedValues);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const notificationData = {
        siteId: Number(selectedSite),
        userIds: selectedUsers,
        title: values.name,
        description: values.description,
      };
      await sendCustomNotification(notificationData).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
      <Button
        type="primary"
        onClick={() => setIsModalOpen(true)}
        className="mb-6 w-full sm:w-auto bg-blue-500 text-white py-2 px-6 rounded-lg text-center"
      >
        {Strings.createNotification}
      </Button>

      <Modal
        title={Strings.createNotification}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleFormSubmit}
        okText={Strings.save}
        cancelText={Strings.cancel}
        className="w-full max-w-2xl"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={Strings.name}
            name="name"
            rules={[{ required: true, message: Strings.requiredName }]}
          >
            <Input placeholder={Strings.notificationName} />
          </Form.Item>
          <Form.Item
            label={Strings.description}
            name="description"
            rules={[{ required: true, message: Strings.requiredDescription }]}
          >
            <TextArea rows={4} placeholder={Strings.notificationDescription} allowClear />
          </Form.Item>
          <Form.Item
            label={Strings.site}
            name="site"
            rules={[{ required: true, message: Strings.requiredSite }]}
          >
            <Select
              placeholder={Strings.notificationsSelectSite}
              onChange={handleSiteChange}
              options={sites.map((site) => ({ value: site.id, label: site.name }))}
            />
          </Form.Item>
          <Button
            type="default"
            disabled={!selectedSite}
            onClick={() => setIsUsersModalOpen(true)}
            className="mt-4 mb-6 w-2/3 max-w-sm bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center mx-auto"
          >
            {Strings.notificationsSelectUsers}
          </Button>
        </Form>
      </Modal>

      <Modal
        title={Strings.notificationsSelectUsers}
        open={isUsersModalOpen}
        onCancel={() => setIsUsersModalOpen(false)}
        onOk={() => setIsUsersModalOpen(false)}
        okText={Strings.save}
        cancelText={Strings.cancel}
        className="w-full max-w-md"
      >
        <Form layout="vertical">
          <Input
            placeholder={Strings.searchUsers}
            value={searchTerm}
            onChange={handleSearch}
            className="mb-4"
          />
          <div className="overflow-y-auto max-h-60">
            <Checkbox.Group
              className="grid grid-cols-2 gap-2"
              onChange={handleUserSelection}
              value={selectedUsers}
            >
              {filteredUsers.map((user) => (
                <Checkbox key={user.id} value={user.id}>
                  {user.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Notifications;
