import { Dropdown, Menu, Avatar } from 'antd';
import {
    UserOutlined,
} from '@ant-design/icons';
import User, { getSiteName } from '../../data/user/user';
import Logout from '../../pages/auth/Logout';

interface UserProfileDropdownProps {
    user?: User;
  }


const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {

    const menu = (
        <Menu style={{ width: 300 }}>
            <Menu.Item key="header" style={dropdownStyles.header}>
                <div style={dropdownStyles.headerContent}>
                    <Avatar size={40} icon={<UserOutlined />} style={dropdownStyles.avatar} />
                    <div>
                        <div style={dropdownStyles.username}>{user?.name}</div>
                        <div style={dropdownStyles.role}>{user?.roles.join(',')}</div>
                    </div>
                   
                    <Logout />
                </div>
            </Menu.Item>
            {/* <Menu.Item key="tabs">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarStyle={styles.tabBar}
                >
                    <TabPane tab="Profile" key="profile">
                        <Menu style={styles.menuContainer}>
                            <Menu.Item key="editProfile" style={styles.menuItem}>
                                <EditOutlined /> Edit Profile
                            </Menu.Item>
                            <Menu.Item key="viewProfile" style={styles.menuItem}>
                                <ProfileOutlined /> View Profile
                            </Menu.Item>
                            <Menu.Item key="socialProfile" style={styles.menuItem}>
                                <ShareAltOutlined /> Social Profile
                            </Menu.Item>
                            <Menu.Item key="billing" style={styles.menuItem}>
                                <DollarOutlined /> Billing
                            </Menu.Item>
                            <Menu.Item key="logout" style={styles.menuItem}>
                                <LogoutOutlined /> Logout
                            </Menu.Item>
                        </Menu>
                    </TabPane>
                    <TabPane tab="Settings" key="settings">
                        <Menu style={styles.menuContainer}>
                            <Menu.Item key="support" style={styles.menuItem}>
                                <QuestionCircleOutlined /> Support
                            </Menu.Item>
                            <Menu.Item key="accountSettings" style={styles.menuItem}>
                                <SettingOutlined /> Account Settings
                            </Menu.Item>
                            <Menu.Item key="privacyCenter" style={styles.menuItem}>
                                <SafetyOutlined /> Privacy Center
                            </Menu.Item>
                            <Menu.Item key="feedback" style={styles.menuItem}>
                                <SmileOutlined /> Feedback
                            </Menu.Item>
                            <Menu.Item key="history" style={styles.menuItem}>
                                <ClockCircleOutlined /> History
                            </Menu.Item>
                        </Menu>
                    </TabPane>
                </Tabs>
            </Menu.Item> */}
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <UserOutlined /> {user?.name}
                <div style={{ fontSize: 12,  color: "#8C8C8C" }}>{getSiteName(user)}</div>
            </a>
        </Dropdown>
    );
};

export const dropdownStyles = {
    header: {
        padding: '16px',
        background: '#f0f2f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between'
    },
    avatar: {
        marginRight: 12
    },
    username: {
        fontWeight: 'bold'
    },
    role: {
        color: '#888'
    },
    logoutIcon: {
        fontSize: '24px'
    },
    logoutButton: {
        border: 'none',
        background: 'none',
        color: '#000',
        marginLeft: 'auto'
    },
    tabBar: {
        borderBottom: 'none'
    },
    menuContainer: {
        border: 'none',
        backgroundColor: '#c4c2c2', // Gray color for the container
        padding: '16px'
    },
    menuItem: {
        color: ' #00913f',
        fontSize: '14px'
    }
};

export default UserProfileDropdown;
