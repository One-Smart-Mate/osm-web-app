import React, { useState } from 'react';
import { Badge, Dropdown, Menu, List } from 'antd';
import { BellOutlined, GiftOutlined, MessageOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';

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

  const menu = (
    <Menu style={{ width: 380, padding: '10px' }}>
      <Menu.Item key="header" style={{ fontWeight: 'bold', padding: '10px 16px' }}>
        Notification
      </Menu.Item>
      <List
        dataSource={notifications}
        renderItem={(item) => (
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
        )}
      />
      <Menu.Divider />
      <Menu.Item key="view-all" style={{ textAlign: 'center', padding: '10px 16px' }}>
        View All
      </Menu.Item>
    </Menu>
  );

  const handleVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      visible={visible}
      onVisibleChange={handleVisibleChange}
      placement="bottomRight"
    >
      <Badge count={5} style={{ marginLeft: '16px', cursor: 'pointer' }}>
        <BellOutlined style={{ fontSize: 20 }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
