import { useState, useEffect } from "react";
import { Modal, Input, Button, Checkbox, Spin, Empty, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Position } from "../../../data/postiions/positions";
import { UserPosition } from "../../../data/user/user";
import Strings from "../../../utils/localizations/Strings";

interface PositionSelectionModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: (selectedPositions: Position[]) => void;
  positions: Position[];
  loading: boolean;
  userPositions: UserPosition[];
}

const PositionSelectionModal = ({
  isVisible,
  onCancel,
  onConfirm,
  positions,
  loading,
  userPositions
}: PositionSelectionModalProps) => {
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset selection when modal opens
  useEffect(() => {
    if (isVisible && userPositions.length > 0) {
      // Get the IDs of positions that the user already has
      const userPositionIds = userPositions.map(position => position.id);
      
      // Set those as initially selected
      setSelectedPositionIds(userPositionIds);
    }
  }, [isVisible, userPositions]);

  // Filter positions based on search text
  const filteredPositions = positions.filter(position => 
    position.name.toLowerCase().includes(searchText.toLowerCase()) ||
    position.levelName?.toLowerCase().includes(searchText.toLowerCase()) ||
    position.areaName?.toLowerCase().includes(searchText.toLowerCase()) ||
    position.status.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate pagination
  const paginatedPositions = filteredPositions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle position selection
  const handlePositionSelection = (positionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPositionIds(prev => [...prev, positionId]);
    } else {
      setSelectedPositionIds(prev => prev.filter(id => id !== positionId));
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
    const selectedPositions = positions.filter(position => 
      selectedPositionIds.includes(position.id)
    );
    onConfirm(selectedPositions);
  };

  return (
    <Modal
      title={Strings.assignPositions}
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
      width={700}
    >
      <div className="mb-4">
        <Input
          placeholder={Strings.searchPositions}
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
      ) : filteredPositions.length === 0 ? (
        <Empty description={Strings.noPositionsAvailable} />
      ) : (
        <>
          <div className="bg-gray-50 rounded-md p-2 max-h-80 overflow-y-auto">
            {paginatedPositions.map(position => (
              <div key={position.id} className="py-2">
                <Checkbox 
                  onChange={(e) => handlePositionSelection(position.id, e.target.checked)}
                  checked={selectedPositionIds.includes(position.id)}
                >
                  <span className="font-medium">{position.name}</span>
                </Checkbox>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredPositions.length}
              onChange={handlePageChange}
              showSizeChanger={false}
              size="small"
            />
          </div>
          
          <div className="mt-4">
            <span className="text-gray-600">
              {Strings.selected}: {selectedPositionIds.length} {selectedPositionIds.length === 1 ? 
                Strings.positionFound : Strings.positionsFound}
            </span>
          </div>
        </>
      )}
    </Modal>
  );
};

export default PositionSelectionModal;
