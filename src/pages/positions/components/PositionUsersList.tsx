import { useEffect, useState, useRef } from "react";
import { Button, List, Spin, Typography } from "antd";
import { UserOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetPositionUsersQuery } from "../../../services/positionService";
import { Responsible } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";

const { Text } = Typography;

interface PositionUsersListProps {
  positionId: string | null;
  positionName?: string;
  onClose: () => void;
  anchorElement: HTMLElement | null;
}

const PositionUsersList = ({
  positionId,
  positionName,
  onClose,
  anchorElement
}: PositionUsersListProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const { data: users = [], isLoading, refetch } = useGetPositionUsersQuery(
    positionId || "",
    {
      skip: !positionId,
      refetchOnMountOrArgChange: true
    }
  );

  useEffect(() => {
    if (anchorElement && modalRef.current) {
      const rect = anchorElement.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();

      // Calculate position to appear near the button
      let top = rect.bottom + 8; // 8px below the button
      let left = rect.left;

      // Adjust if modal would go off-screen
      if (left + 300 > window.innerWidth) {
        left = window.innerWidth - 320; // 300px width + 20px margin
      }

      if (top + 200 > window.innerHeight) {
        top = rect.top - 208; // Show above the button instead
      }

      setPosition({ top, left });
    }
  }, [anchorElement]);

  useEffect(() => {
    if (positionId) {
      refetch();
    }
  }, [positionId, refetch]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!positionId) return null;

  return (
    <div
      ref={modalRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 animate-in slide-in-from-top-1 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '300px',
        maxHeight: '400px',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div>
          <Text strong className="text-blue-600 text-sm">
            {Strings.assignedUsers}
          </Text>
          {positionName && (
            <div className="text-xs text-gray-500 mt-1">
              {positionName}
            </div>
          )}
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
        />
      </div>

      {/* Content */}
      <div className="p-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="default" />
          </div>
        ) : !users.length ? (
          <div className="text-center py-8">
            <UserOutlined className="text-gray-300 text-2xl mb-2" />
            <Text type="secondary" className="block text-sm">
              {Strings.noAssignedUsers}
            </Text>
          </div>
        ) : (
          <List
            size="small"
            dataSource={users}
            renderItem={(user: Responsible) => (
              <List.Item className="px-2 py-3 hover:bg-gray-50 rounded-md transition-colors duration-150">
                <div className="flex items-center w-full">
                  <UserOutlined className="text-blue-500 mr-3 text-base" />
                  <div className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-gray-800 truncate block">
                      {user.name}
                    </Text>
                    {user.email && (
                      <Text className="text-xs text-gray-500 truncate block">
                        {user.email}
                      </Text>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
            className="divide-y-0"
          />
        )}
      </div>

      {/* Footer with user count */}
      {users.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <Text className="text-xs text-gray-500">
            {users.length} {users.length === 1 ? 'usuario' : 'usuarios'} {/* TODO: Add to Strings */}
          </Text>
        </div>
      )}
    </div>
  );
};

export default PositionUsersList;