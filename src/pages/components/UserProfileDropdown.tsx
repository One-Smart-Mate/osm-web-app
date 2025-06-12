import { Dropdown, Avatar, Tag, Typography, theme, App } from "antd";
import { UserOutlined, DownloadOutlined } from "@ant-design/icons";
import User, { getSiteName } from "../../data/user/user";
import Logout from "../auth/Logout";
import { MenuProps } from "antd/lib";
import EditProfileButton from "./modals/EditProfileButton";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { BsFilePdf } from "react-icons/bs";
import Strings from "../../utils/localizations/Strings";
import AnatomyNotification from "./AnatomyNotification";
import * as zipjs from "@zip.js/zip.js";

/**
 * Props for the UserProfileDropdown component
 */
interface UserProfileDropdownProps {
  user?: User;
}

/**
 * User profile dropdown component that displays user information and provides
 * access to various user-related actions including error log download
 */
const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const { token } = theme.useToken();

  /**
   * Get the first letter of the user's name for the avatar
   */
  const getFirstNameLetter = (): string => {
    const name = user?.name ?? "";
    if (name.length > 1) {
      return name[0];
    }
    return name;
  };

  /**
   * Handle the download of encrypted error logs as a password-protected ZIP file
   * Uses environment variable for ZIP password
   */
  const handleDownloadLogs = async () => {
    try {
      // Get logs and sort them from newest to oldest
      const errorLogs = AnatomyNotification.getErrorLogs();
      // Sort logs by timestamp in descending order (newest first)
      const sortedLogs = [...errorLogs].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      const logContent =
        sortedLogs.length > 0
          ? sortedLogs.map((log) => `${log.timestamp}: ${log.error}`).join("\n")
          : "No errors found in the log. This is a sample file.";

      const textBlob = new Blob([logContent], { type: "text/plain" });

      // Get password from environment variable with fallback
      const zipPassword = import.meta.env.VITE_ERROR_LOGS_ZIP_PASSWORD as string || "OSM2025SecurePassword";
      console.log("Using fixed ZIP password, length:", zipPassword.length);

      // Create encrypted ZIP file with error logs
      const zipWriter = new zipjs.ZipWriter(
        new zipjs.BlobWriter("application/zip")
      );
      await zipWriter.add(
        `error-logs-${new Date().toISOString().slice(0, 10)}.txt`,
        new zipjs.BlobReader(textBlob),
        { password: zipPassword }
      );

      // Generate download link
      const zipBlob = await zipWriter.close();
      const url = URL.createObjectURL(zipBlob);

      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = `app-error-logs-${new Date()
          .toISOString()
          .slice(0, 10)}.zip`;
        downloadLinkRef.current.click();
        URL.revokeObjectURL(url);
      }

      // Use AnatomyNotification instead of message for consistency
      const { notification } = App.useApp();
      notification.success({
        message: "Success!",
        description: Strings.logsDownloadedSuccessfully,
      });
    } catch (error) {
      console.error("Error generating logs file:", error);
      // Use AnatomyNotification instead of message for consistency
      const { notification } = App.useApp();
      notification.error({
        message: "Error!",
        description: Strings.errorGeneratingLogsFile,
      });
    }
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
    {
      key: "download_logs",
      label: (
        <div
          className="flex flex-wrap flex-row items-center p-2"
          onClick={handleDownloadLogs}
        >
          <DownloadOutlined
            className="mr-2"
            style={{ color: token.colorPrimary }}
            size={18}
          />
          <Typography.Text style={{ color: token.colorPrimary }}>
            {Strings.downloadErrorLogs}
          </Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <span className="cursor-pointer">
          <UserOutlined />{" "}
          <span style={{ color: token.colorPrimary }}>{user?.name}</span>
          <div style={{ fontSize: 12, color: "#8C8C8C" }}>
            {getSiteName(user)}
          </div>
        </span>
      </Dropdown>

      {/* Hidden download link */}
      <a ref={downloadLinkRef} style={{ display: "none" }} />
    </>
  );
};

export default UserProfileDropdown;
