import { useState, useEffect } from "react";
import { Modal, Input, Button, Checkbox, Spin, Empty, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Responsible } from "../data/user/user";
import Strings from "../utils/localizations/Strings";

interface UserSelectionModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: (selectedUserIds: number[]) => void;
  users: Responsible[];
  loading: boolean;
  initialSelectedUserIds?: number[];
  title?: string;
}

const UserSelectionModal = ({
  isVisible,
  onCancel,
  onConfirm,
  users,
  loading,
  initialSelectedUserIds = [],
  title = Strings.assignedUsers
}: UserSelectionModalProps) => {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(initialSelectedUserIds);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset selected users when the modal opens with initial values
  useEffect(() => {
    if (isVisible && initialSelectedUserIds) {
      setSelectedUserIds(initialSelectedUserIds);
    }
  }, [isVisible, initialSelectedUserIds]);

  // Filter users based on search text
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate pagination
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle user selection
  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    onConfirm(selectedUserIds);
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {Strings.cancel}
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          {Strings.confirm}
        </Button>
      ]}
      width={600}
    >
      <div className="mb-4">
        <Input
          placeholder={Strings.search}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          allowClear
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Empty description={Strings.noUsersAvailableForSite} />
      ) : (
        <>
          <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
            {paginatedUsers.map(user => (
              <div key={user.id} className="py-2 border-b last:border-b-0">
                <Checkbox 
                  onChange={(e) => handleUserSelection(Number(user.id), e.target.checked)}
                  checked={selectedUserIds.includes(Number(user.id))}
                >
                  <span className="font-medium">{user.name}</span>
                </Checkbox>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredUsers.length}
              onChange={handlePageChange}
              showSizeChanger={false}
              size="small"
            />
          </div>
          
          <div className="mt-4">
            <span className="text-gray-600">
              {Strings.selected}: {selectedUserIds.length}
            </span>
          </div>
        </>
      )}
    </Modal>
  );
};

export default UserSelectionModal;
