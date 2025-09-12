import React, { useState } from 'react';
import { Modal, Card, Button, Row, Col, Spin, Input, Empty, List, Typography } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Position } from '../../../data/postiions/positions';
import { Responsible } from '../../../data/user/user';
import { useGetPositionsBySiteIdQuery, useGetPositionUsersQuery } from '../../../services/positionService';
import Strings from '../../../utils/localizations/Strings';
import { theme } from 'antd';
import useDarkMode from '../../../utils/hooks/useDarkMode';

interface PositionSelectionModalProps {
  isVisible: boolean;
  siteId: string | number;
  onCancel: () => void;
  onPositionSelect: (_position: Position) => void;
}

const { Text } = Typography;

// Componente para mostrar los usuarios de una posición
const PositionUsers = ({ positionId }: { positionId: string }) => {
  const { data: users = [], isLoading } = useGetPositionUsersQuery(positionId, {
    refetchOnMountOrArgChange: true
  });

  if (isLoading) {
    return <Spin size="small" />;
  }

  if (!users.length) {
    return <Text type="secondary">{Strings.noAssignedUsers}</Text>;
  }

  return (
    <List
      size="small"
      bordered
      className="shadow-md rounded-md bg-white max-w-xs"
      dataSource={users}
      renderItem={(user: Responsible) => (
        <List.Item>
          <UserOutlined className="mr-2" /> {user.name}
        </List.Item>
      )}
    />
  );
};

const PositionSelectionModal: React.FC<PositionSelectionModalProps> = ({
  isVisible,
  siteId,
  onCancel,
  onPositionSelect,
}) => {
  const { token } = theme.useToken();
  const isDarkMode = useDarkMode();
  const [searchText, setSearchText] = useState('');
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  // Fetch positions by site ID
  const { data: positions, isLoading, error } = useGetPositionsBySiteIdQuery(siteId.toString());
  
  // Filtered positions based on search
  const filteredPositions = positions?.filter(position => {
    const searchLower = searchText.toLowerCase();
    return (
      position.name.toLowerCase().includes(searchLower) ||
      position.areaName.toLowerCase().includes(searchLower) ||
      position.levelName.toLowerCase().includes(searchLower) ||
      (position.description && position.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Modal
      title={Strings.selectPosition}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
    >
      <div className="mb-4">
        <Input
          placeholder={Strings.searchPosition}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          {Strings.errorLoadingPositions}
        </div>
      ) : filteredPositions && filteredPositions.length > 0 ? (
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px' }}>
          <Row gutter={[16, 16]}>
            {filteredPositions.map((position) => (
              <Col xs={24} md={12} key={position.id}>
                <Card
                  className="position-card"
                  style={{
                    borderColor: token.colorBorder,
                    backgroundColor: isDarkMode ? token.colorBgContainer : undefined,
                  }}
                >
                  <div className="flex justify-between">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-1">{position.name}</h3>
                      <p className="text-sm mb-1">
                        <strong>{Strings.area}:</strong> {position.areaName}
                      </p>
                      <p className="text-sm mb-1">
                        <strong>{Strings.level}:</strong> {position.levelName}
                      </p>
                      {position.description && (
                        <p className="text-sm mb-1">
                          <strong>{Strings.description}:</strong> {position.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-center space-y-2">
                      <Button 
                        type="primary" 
                        onClick={() => onPositionSelect(position)}
                      >
                        {Strings.select}
                      </Button>
                      <Button
                        type="default"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenPopoverId(openPopoverId === position.id.toString() ? null : position.id.toString());
                        }}
                        className={openPopoverId === position.id.toString() ? "text-blue-500" : ""}
                      >
                        {Strings.users || "Usuarios"}
                      </Button>
                    </div>
                  </div>
                  {openPopoverId === position.id.toString() && (
                    <div className="mt-3 border-t pt-2">
                      <div className="font-medium text-blue-600 mb-2">
                        {Strings.assignedUsers || "Usuarios asignados"}
                      </div>
                      <PositionUsers positionId={position.id.toString()} />
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Empty description={Strings.noPositionsFound} />
      )}
    </Modal>
  );
};

export default PositionSelectionModal;
