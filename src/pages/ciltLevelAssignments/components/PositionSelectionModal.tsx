import React, { useState } from 'react';
import { Modal, Card, Button, Row, Col, Spin, Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Position } from '../../../data/postiions/positions';
import { useGetPositionsBySiteIdQuery } from '../../../services/positionService';
import Strings from '../../../utils/localizations/Strings';
import { theme } from 'antd';
import useDarkMode from '../../../utils/hooks/useDarkMode';

interface PositionSelectionModalProps {
  isVisible: boolean;
  siteId: string | number;
  onCancel: () => void;
  onPositionSelect: (position: Position) => void;
}

const PositionSelectionModal: React.FC<PositionSelectionModalProps> = ({
  isVisible,
  siteId,
  onCancel,
  onPositionSelect,
}) => {
  const { token } = theme.useToken();
  const isDarkMode = useDarkMode();
  const [searchText, setSearchText] = useState('');
  
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
                    <div className="ml-4 flex items-center">
                      <Button 
                        type="primary" 
                        onClick={() => onPositionSelect(position)}
                      >
                        {Strings.select}
                      </Button>
                    </div>
                  </div>
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
