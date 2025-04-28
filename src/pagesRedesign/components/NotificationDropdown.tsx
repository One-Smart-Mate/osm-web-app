import React, { useState } from 'react';
import { Badge, Dropdown, List, MenuProps, Typography } from 'antd';
import { BellOutlined, GiftOutlined, MessageOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import Strings from '../../utils/localizations/Strings';

const NotificationDropdown: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const notifications = [
    {
      title: "It's Cristina danny's birthday today.",
      time: '3:00 AM',
      timestamp: '2 min ago',
      icon: <GiftOutlined style={{ color: 'green' }} />,
    },
    {
      title: 'Aida Burg commented your post.',
      time: '6:00 AM',
      timestamp: '5 August',
      icon: <MessageOutlined style={{ color: 'blue' }} />,
    },
    {
      title: 'Your Profile is Complete 60%',
      time: '2:45 PM',
      timestamp: '7 hours ago',
      icon: <SettingOutlined style={{ color: 'red' }} />,
    },
    {
      title: 'Cristina Danny invited to join Meeting.',
      time: '9:10 PM',
      timestamp: 'Daily scrum meeting time',
      icon: <TeamOutlined style={{ color: 'blue' }} />,
    },
  ];

  // Define menu items as an array of ItemType[]
  const menuItems: MenuProps["items"] = [
    {
      key: 'header',
      label: <Typography.Text className="p-4" strong>{Strings.notificationsSB}</Typography.Text>,
      disabled: true, // Disable the header item to make it non-clickable
    },
    ...notifications.map((item) => ({
      key: item.title,
      label: (
        <List.Item key={item.title} style={{ padding: '12px 16px' }}>
          <List.Item.Meta
            avatar={item.icon}
            title={item.title}
            description={
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>{item.time}</span>
                <span style={{ color: '#999' }}>{item.timestamp}</span>
              </div>
            }
          />
        </List.Item>
      ),
    }))
  ];

  const handleVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  return (
    <Dropdown
      menu={{ items: menuItems }} // Use the menu prop instead of overlay
      trigger={['click']}
      open={visible}
      onOpenChange={handleVisibleChange}
      placement="bottomRight"
    >
      <a><Badge count={5} style={{ marginLeft: '16px', cursor: 'pointer' }}>
        <BellOutlined style={{ fontSize: 20 }} />
      </Badge></a>
    </Dropdown>
  );
};

export default NotificationDropdown;
