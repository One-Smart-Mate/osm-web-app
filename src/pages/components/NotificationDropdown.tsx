import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Empty,
  MenuProps,
  Typography,
} from "antd";
import {
  BellOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Strings from "../../utils/localizations/Strings";
import { usePushNotifications } from "../../utils/hooks/usePushNotifications";

const NotificationDropdown: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { notifications, clearNotifications } = usePushNotifications();
  const notificationList = Array.isArray(notifications) ? notifications : [];

  const handleClearNotifications = () => {
    clearNotifications();
    setVisible(false); // Close dropdown after clearing
  };

  // Define menu items as an array of ItemType[]
  const menuItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div className="flex justify-between items-center p-2">
          <Typography.Text strong>
            {Strings.notificationsSB} ({notificationList.length})
          </Typography.Text>
          {notificationList.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleClearNotifications}
              className="text-red-500 hover:text-red-700"
            >
              Limpiar
            </Button>
          )}
        </div>
      ),
      disabled: true,
    },
    {
      key: "divider",
      type: "divider",
    },
    // Show notifications if any exist
    ...notificationList.length > 0 
      ? notificationList.map((item, index) => ({
          key: `notification-${index}`,
          label: (
            <div className="p-2 hover:bg-gray-50 rounded">
              <div className="flex flex-row items-start gap-3">
                <Avatar size="small" className="mt-1">
                  {item.title?.[0] || 'N'}
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <Typography.Text strong className="block truncate">
                    {item.title || 'Sin título'}
                  </Typography.Text>
                  <Typography.Text type="secondary" className="text-sm block">
                    {item.body || 'Sin contenido'}
                  </Typography.Text>
                </div>
              </div>
            </div>
          ),
        }))
      : [
          {
            key: "empty",
            label: (
              <div className="p-4 text-center">
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay notificaciones"
                />
              </div>
            ),
            disabled: true,
          }
        ],
  ];

  const handleVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      open={visible}
      onOpenChange={handleVisibleChange}
      placement="bottomRight"
      overlayStyle={{ 
        width: 320,
        maxHeight: 400,
        overflow: 'auto'
      }}
    >
      <a>
        <Badge
          count={notificationList.length}
          style={{ marginLeft: "16px", cursor: "pointer" }}
        >
          <BellOutlined style={{ fontSize: 20 }} />
        </Badge>
      </a>
    </Dropdown>
  );
};

export default NotificationDropdown;
