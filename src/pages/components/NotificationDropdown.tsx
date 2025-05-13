import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Empty,
  List,
  MenuProps,
  Typography,
} from "antd";
import {
  BellOutlined,
} from "@ant-design/icons";
import Strings from "../../utils/localizations/Strings";
import { usePushNotifications } from "../../utils/hooks/usePushNotifications";

const NotificationDropdown: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { notifications, clearNotifications } = usePushNotifications();
  const notificationList = Array.isArray(notifications) ? notifications : [];

  // Define menu items as an array of ItemType[]
  const menuItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <Typography.Text className="p-4" strong>
          {Strings.notificationsSB}
        </Typography.Text>
      ),
      disabled: true, // Disable the header item to make it non-clickable
    },
    ...notificationList.map((item, index) => ({
      key: index,
      label: (
        <List.Item key={item.index}>
          <List.Item.Meta
            description={
              <div className="flex flex-row items-center gap-2">
                <Avatar>{item.title[0]}</Avatar>
                <div className="flex  flex-col">
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Typography.Text >{item.body}</Typography.Text>
                </div>
              </div>
            }
          />
        </List.Item>
      ),
    })),
    {
      key: "remove",
      label:
        notificationList.length > 0 ? (
          <Button type="link" className="p-4">
            Clean
          </Button>
        ) : null,
      onClick: () => {
        clearNotifications();
      },
    },
    {
      key: "empty",
      label:
        notificationList.length == 0 ? (
          <Empty />
        ) : null,
    },
  ];

  const handleVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  return (
    <Dropdown
      menu={{ items: menuItems }} // Use the menu prop instead of overlay
      trigger={["click"]}
      open={visible}
      onOpenChange={handleVisibleChange}
      placement="bottomRight"
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
