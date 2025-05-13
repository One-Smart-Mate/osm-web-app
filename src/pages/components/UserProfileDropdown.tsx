import { Dropdown, Avatar, Tooltip, Tag, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import User, { getSiteName } from "../../data/user/user";
import Logout from "../auth/Logout";
import { MenuProps } from "antd/lib";

interface UserProfileDropdownProps {
  user?: User;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {

  const getFirstNameLetter = (): string => {
    const name = user?.name ?? "";
    if (name.length > 1) {
      return name[0]
    }
    return name;
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div className="flex align-center justify-between p-4 bg-gray-100 items-center">
          <Avatar size={50} className="mr-2">
            {getFirstNameLetter()}
          </Avatar>
          <div className="flex flex-col flex-wrap mr-2 ml-2">
            <Typography.Text>{user?.name}</Typography.Text>
            <div>
              <div className="flex flex-wrap flex-row max-w-[200px] gap-2">
                {user?.roles.map((role: string) => (
                  <Tooltip key={role} title={role}>
                    <Tag color="blue" style={{ fontSize: 10 }}>
                      {role}
                    </Tag>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
          <Logout />
        </div>
      ),
      disabled: true,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
      <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
        <UserOutlined /> {user?.name}
        <div style={{ fontSize: 12, color: "#8C8C8C" }}>
        {getSiteName(user)}
        </div>
      </a>
    </Dropdown>
  );
};

export default UserProfileDropdown;
