import { Dropdown, Avatar, Tag, Typography, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";
import User, { getSiteName } from "../../data/user/user";
import Logout from "../auth/Logout";
import { MenuProps } from "antd/lib";
import EditProfileButton from "./modals/EditProfileButton";
import { Link } from "react-router-dom";
import { BsFilePdf } from "react-icons/bs";
import Strings from "../../utils/localizations/Strings";

interface UserProfileDropdownProps {
  user?: User;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {
  const { token } = theme.useToken();

  const getFirstNameLetter = (): string => {
    const name = user?.name ?? "";
    if (name.length > 1) {
      return name[0];
    }
    return name;
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "user_profile",
      label: (
        <div className="flex align-center justify-between p-4 items-center">
          <Avatar size={50} className="mr-2">
            {getFirstNameLetter()}
          </Avatar>
          <div className="flex flex-col flex-wrap mr-2 ml-2">
            <Typography.Text>{user?.name}</Typography.Text>
            <div>
              <div className="flex flex-wrap flex-row max-w-[200px] gap-2">
                {user?.roles.map((role: string) => (
                  <Tag color="blue" style={{ fontSize: 10 }}>
                      {role}
                    </Tag>
                ))}
              </div>
            </div>
          </div>
          <Logout />
        </div>
      ),
    },
    {
      key: "profile",
      label: <EditProfileButton />,
    },
    {
      key: "user_manual",
      label: (
        <Link
          to={import.meta.env.VITE_PDF_MANUAL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div className="flex flex-wrap flex-row items-center p-2">
            <BsFilePdf className="mr-2" color={token.colorPrimary} size={18} />
            <Typography.Text style={{ color: token.colorPrimary }}>
              {Strings.manual}
            </Typography.Text>
          </div>
        </Link>
      ),
    },
    {
      key: "close_session",
      label: <Logout enableText={true} />,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
      <span className="cursor-pointer">
        <UserOutlined />{" "}
        <span style={{ color: token.colorPrimary }}>{user?.name}</span>
        <div style={{ fontSize: 12, color: "#8C8C8C" }}>
          {getSiteName(user)}
        </div>
      </span>
    </Dropdown>
  );
};

export default UserProfileDropdown;
