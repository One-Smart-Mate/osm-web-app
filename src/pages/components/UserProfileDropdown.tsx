import { Dropdown, Avatar, Tag, Typography, theme, App, Modal, Input, Button } from "antd";
import { UserOutlined, DownloadOutlined, KeyOutlined, CopyOutlined } from "@ant-design/icons";
import User from "../../data/user/user";
import Logout from "../auth/Logout";
import { MenuProps } from "antd/lib";
import EditProfileButton from "./modals/EditProfileButton";
import { Link, useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import { BsFilePdf } from "react-icons/bs";
import Strings from "../../utils/localizations/Strings";
import AnatomyNotification from "./AnatomyNotification";
import * as zipjs from "@zip.js/zip.js";
import { useUpdateUserMutation, useGetUserMutation } from "../../services/userService";
import { UpdateUser } from "../../data/user/user.request";
import { useAppSelector } from "../../core/store";
import { selectSiteId, selectIsSessionLocked } from "../../core/genericReducer";

/**
 * Props for the UserProfileDropdown component
 */
interface UserProfileDropdownProps {
  user: User;
}

/**
 * User profile dropdown component that displays user information and provides
 * access to various user-related actions including error log download and fast password generation
 */
const UserProfileDropdown = ({ user }: UserProfileDropdownProps) => {
  const { token } = theme.useToken();
  const { notification } = App.useApp();
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const [generatingPassword, setGeneratingPassword] = useState(false);
  const [fastPasswordModalVisible, setFastPasswordModalVisible] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const location = useLocation();
  
  
  const isSessionLocked = useAppSelector(selectIsSessionLocked);
  
  
  const reduxSiteId = useAppSelector(selectSiteId);
  const locationSiteId = location.state?.siteId;
  const userFirstSiteId = user?.sites?.[0]?.id;
  
  
  const currentSiteId = locationSiteId || reduxSiteId || userFirstSiteId;

  const [updateUser] = useUpdateUserMutation();
  const [getUser] = useGetUserMutation();

  /**
   * Generate fast password function using alphabetic characters
   */
  const generateFastPassword = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  /**
   * Copy fast password to clipboard
   */
  const copyFastPasswordToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword).then(() => {
      notification.success({
        message: Strings.success,
        description: Strings.fastPasswordCopiedToClipboard.replace("{password}", generatedPassword),
        duration: 3,
      });
    }).catch(() => {
      notification.error({
        message: Strings.error,
        description: Strings.fastPasswordCopyError,
        duration: 3,
      });
    });
  };

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
   * Generate a random 4-letter fast password and update it in the backend
   */
  const handleGenerateFastPassword = async () => {
    if (isSessionLocked) return; 
    
    if (!currentSiteId) {
      notification.warning({
        message: Strings.warning,
        description: Strings.siteIdRequired,
      });
      return;
    }

    try {
      setGeneratingPassword(true);
      
      
      const newFastPassword = generateFastPassword();
      
      
      const userDetails = await getUser(user.userId).unwrap();
      
      
      const updateData = new UpdateUser(
        parseInt(userDetails.id),
        userDetails.name,
        userDetails.email,
        parseInt(currentSiteId),
        "", 
        userDetails.uploadCardDataWithDataNet,
        userDetails.uploadCardEvidenceWithDataNet,
        userDetails.roles.map((role: any) => parseInt(role)),
        userDetails.status,
        newFastPassword, 
        "", 
        "ES" 
      );
      
      await updateUser(updateData).unwrap();
      
      
      setGeneratedPassword(newFastPassword);
      setFastPasswordModalVisible(true);
      
      notification.success({
        message: Strings.success,
        description: Strings.fastPasswordUpdatedSuccessfully.replace("{password}", newFastPassword),
        duration: 4,
      });
      
    } catch (error: any) {
      notification.error({
        message: Strings.error,
        description: error?.data?.message || Strings.fastPasswordGenerationError,
        duration: 4,
      });
    } finally {
      setGeneratingPassword(false);
    }
  };

  /**
   * Handle closing the fast password modal
   */
  const handleCloseFastPasswordModal = () => {
    setFastPasswordModalVisible(false);
    setGeneratedPassword("");
  };

  /**
   * Handle the download of encrypted error logs as a password-protected ZIP file
   * Uses environment variable for ZIP password
   */
  const handleDownloadLogs = async () => {
    if (isSessionLocked) return; 
    
    try {
      const logs = JSON.parse(localStorage.getItem("errorLogs") || "[]");
      
      if (logs.length === 0) {
        notification.info({
          message: Strings.information,
          description: Strings.noErrorLogsFound,
        });
        return;
      }

      const zipWriter = new zipjs.ZipWriter(new zipjs.BlobWriter("application/zip"));
      
      const logContent = logs.map((log: any, index: number) => 
        `Log ${index + 1}:\n` +
        `Timestamp: ${log.timestamp}\n` +
        `Error: ${log.error}\n` +
        `Stack: ${log.stack}\n` +
        `User Agent: ${log.userAgent}\n` +
        `URL: ${log.url}\n` +
        `Additional Info: ${JSON.stringify(log.additionalInfo, null, 2)}\n` +
        `${"=".repeat(50)}\n`
      ).join("\n");

      await zipWriter.add("error-logs.txt", new zipjs.TextReader(logContent));
      const zipBlob = await zipWriter.close();
      
      const url = URL.createObjectURL(zipBlob);
      const link = downloadLinkRef.current;
      if (link) {
        link.href = url;
        link.download = `error-logs-${new Date().toISOString().split('T')[0]}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      notification.success({
        message: Strings.success,
        description: Strings.errorLogsDownloadedSuccessfully,
      });
    } catch (error) {
      AnatomyNotification.error(notification, error);
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
      key: "generate_fast_password",
      label: (
        <div
          className="flex flex-wrap flex-row items-center p-2"
          onClick={handleGenerateFastPassword}
        >
          <KeyOutlined
            className="mr-2"
            style={{ color: token.colorPrimary }}
            size={18}
            spin={generatingPassword}
          />
          <Typography.Text style={{ color: token.colorPrimary }}>
            {generatingPassword ? "Generating..." : Strings.generateFastPassword}
          </Typography.Text>
        </div>
      ),
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
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={isSessionLocked ? [] : ["click"]} 
        overlayStyle={{
          backgroundColor: token.colorBgElevated,
          borderRadius: token.borderRadius,
          boxShadow: token.boxShadowSecondary,
        }}
        disabled={isSessionLocked} 
      >
        <div 
          className={`flex items-center gap-2 px-2 py-1 rounded ${
            isSessionLocked 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer hover:bg-gray-100'
          }`}
          style={{
            pointerEvents: isSessionLocked ? 'none' : 'auto'
          }}
        >
          <Avatar
            size="small"
            icon={<UserOutlined />}
            src={user.logo}
            className="flex-shrink-0"
            style={{
              opacity: isSessionLocked ? 0.5 : 1
            }}
          />
          <span 
            className="text-sm font-medium truncate max-w-32"
            style={{
              opacity: isSessionLocked ? 0.5 : 1,
              color: isSessionLocked ? token.colorTextDisabled : token.colorText
            }}
          >
            {user.name}
          </span>
        </div>
      </Dropdown>
      
      {/* Hidden download link for error logs */}
      <a ref={downloadLinkRef} style={{ display: "none" }} />

      {/* Fast Password Modal */}
      <Modal
        title={Strings.fastPasswordModalTitle}
        open={fastPasswordModalVisible && !isSessionLocked} 
        onCancel={handleCloseFastPasswordModal}
        footer={[
          <Button key="close" onClick={handleCloseFastPasswordModal}>
            {Strings.close}
          </Button>
        ]}
        width={400}
        centered
      >
        <div className="space-y-4">
          <Typography.Text>
            {Strings.fastPasswordModalDescription}
          </Typography.Text>
          
          <div className="flex gap-2">
            <Input
              value={generatedPassword}
              readOnly
              size="large"
              className="font-mono text-lg text-center"
              style={{ 
                backgroundColor: token.colorBgContainer,
                fontWeight: 'bold',
                letterSpacing: '2px'
              }}
            />
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={copyFastPasswordToClipboard}
              size="large"
            >
              {Strings.copy}
            </Button>
          </div>
          
          <Typography.Text type="secondary" className="text-sm">
            {Strings.fastPasswordModalWarning}
          </Typography.Text>
        </div>
      </Modal>
    </>
  );
};

export default UserProfileDropdown;
