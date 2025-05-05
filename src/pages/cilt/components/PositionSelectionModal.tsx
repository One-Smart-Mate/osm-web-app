import React, { useState, useEffect } from "react";
import { Modal, List, Input, Button, Space, Spin, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useGetPositionsBySiteIdQuery } from "../../../services/positionService";
import { Position } from "../../../data/postiions/positions";
import Strings from "../../../utils/localizations/Strings";

const { Text } = Typography;

interface PositionSelectionModalProps {
  visible: boolean;
  siteId: string;
  onCancel: () => void;
  onPositionSelect: (position: Position) => void;
}

const PositionSelectionModal: React.FC<PositionSelectionModalProps> = ({
  visible,
  siteId,
  onCancel,
  onPositionSelect,
}) => {
  const [searchText, setSearchText] = useState("");
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);

  const {
    data: positions = [],
    isLoading,
    error,
  } = useGetPositionsBySiteIdQuery(siteId, {
    skip: !siteId || !visible,
  });

  useEffect(() => {
    if (positions && positions.length > 0) {
      if (searchText === "") {
        setFilteredPositions(positions);
      } else {
        const filtered = positions.filter((position) =>
          position.name?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredPositions(filtered);
      }
    }
  }, [visible, positions]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!positions) return;

    const filtered = positions.filter((position) =>
      position.name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPositions(filtered);
  };

  return (
    <Modal
      title={Strings.ciltMstrSelectPositionTitle}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={null}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input
          placeholder={Strings.searchPositions}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip={Strings.loading} />
          </div>
        ) : error ? (
          <Text type="danger">{Strings.noPositionsToShow}</Text>
        ) : (
          <List
            dataSource={filteredPositions}
            renderItem={(position) => (
              <List.Item
                key={position.id}
                actions={[
                  <Button
                    type="primary"
                    onClick={() => onPositionSelect(position)}
                  >
                    {Strings.ciltMstrCreateButtonLabel}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={position.name}
                  description={position.areaName}
                />
              </List.Item>
            )}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Space>
    </Modal>
  );
};

export default PositionSelectionModal;
