import React, { useState } from 'react';
import { Modal, Card, Button, Row, Col, Spin, Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr';
import { useGetCiltMstrBySiteQuery } from '../../../services/cilt/ciltMstrService';
import Strings from '../../../utils/localizations/Strings';
import { theme } from 'antd';
import useDarkMode from '../../../utils/hooks/useDarkMode';

interface CiltMstrSelectionModalProps {
  isVisible: boolean;
  siteId: string | number;
  onCancel: () => void;
  onCiltMstrSelect: (ciltMstr: CiltMstr) => void;
}

const CiltMstrSelectionModal: React.FC<CiltMstrSelectionModalProps> = ({
  isVisible,
  siteId,
  onCancel,
  onCiltMstrSelect,
}) => {
  const { token } = theme.useToken();
  const isDarkMode = useDarkMode();
  const [searchText, setSearchText] = useState('');
  
  // Fetch CILT Masters by site ID
  const { data: ciltMstrs, isLoading, error } = useGetCiltMstrBySiteQuery(siteId.toString());
  
  // Filtered CILT Masters based on search
  const filteredCiltMstrs = ciltMstrs?.filter(ciltMstr => {
    const searchLower = searchText.toLowerCase();
    return (
      (ciltMstr.ciltName && ciltMstr.ciltName.toLowerCase().includes(searchLower)) ||
      (ciltMstr.ciltDescription && ciltMstr.ciltDescription.toLowerCase().includes(searchLower)) ||
      (ciltMstr.creatorName && ciltMstr.creatorName.toLowerCase().includes(searchLower))
    );
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal
      title={Strings.selectCiltMstr}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
    >
      <div className="mb-4">
        <Input
          placeholder={Strings.searchCiltMstr}
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
          {Strings.errorLoadingCiltMstrs}
        </div>
      ) : filteredCiltMstrs && filteredCiltMstrs.length > 0 ? (
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px' }}>
          <Row gutter={[16, 16]}>
            {filteredCiltMstrs.map((ciltMstr) => (
              <Col xs={24} md={12} key={ciltMstr.id}>
                <Card
                  className="cilt-mstr-card"
                  style={{
                    borderColor: token.colorBorder,
                    backgroundColor: isDarkMode ? token.colorBgContainer : undefined,
                  }}
                >
                  <div className="flex justify-between">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-1">{ciltMstr.ciltName}</h3>
                      {ciltMstr.ciltDescription && (
                        <p className="text-sm mb-1">
                          <strong>{Strings.description}:</strong> {ciltMstr.ciltDescription}
                        </p>
                      )}
                      {ciltMstr.creatorName && (
                        <p className="text-sm mb-1">
                          <strong>{Strings.creator}:</strong> {ciltMstr.creatorName}
                        </p>
                      )}
                      {ciltMstr.standardTime && (
                        <p className="text-sm mb-1">
                          <strong>{Strings.standardTime}:</strong> {ciltMstr.standardTime}
                        </p>
                      )}
                      <p className="text-sm mb-1">
                        <strong>{Strings.created}:</strong> {formatDate(ciltMstr.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <Button 
                        type="primary" 
                        onClick={() => onCiltMstrSelect(ciltMstr)}
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
        <Empty description={Strings.noCiltMstrsFound} />
      )}
    </Modal>
  );
};

export default CiltMstrSelectionModal;
