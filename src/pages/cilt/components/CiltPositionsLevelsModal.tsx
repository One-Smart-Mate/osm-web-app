import React, { useEffect, useState } from 'react';
import { Modal, Table, Typography, Spin, Badge, Card, Empty, Tooltip } from 'antd';
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr';
import { useGetCiltMstrPositionLevelsByCiltMstrIdQuery } from '../../../services/cilt/assignaments/ciltMstrPositionsLevelsService';
import { useGetlevelMutation } from '../../../services/levelService';
import Strings from '../../../utils/localizations/Strings';
import type { ColumnsType } from 'antd/es/table';

interface CiltPositionsLevelsModalProps {
  visible: boolean;
  cilt: CiltMstr | null;
  onCancel: () => void;
}

interface PositionLevelData {
  id: number;
  positionName: string;
  positionDescription: string;
  areaName: string;
  levelId: number;
  levelName: string;
  levelDescription: string;
  nodeResponsableName: string;
  status: string;
  createdAt: string;
}

const { Text, Title } = Typography;

const CiltPositionsLevelsModal: React.FC<CiltPositionsLevelsModalProps> = ({
  visible,
  cilt,
  onCancel,
}) => {
  const [processedData, setProcessedData] = useState<PositionLevelData[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  const { data: assignmentData, isLoading, error } = useGetCiltMstrPositionLevelsByCiltMstrIdQuery(
    cilt?.id || 0,
    {
      skip: !cilt?.id || !visible,
    }
  );

  const [getLevel] = useGetlevelMutation();

  useEffect(() => {
    if (assignmentData && Array.isArray(assignmentData) && visible) {
      fetchLevelDetails(assignmentData);
    } else {
      setProcessedData([]);
    }
  }, [assignmentData, visible]);

  const fetchLevelDetails = async (assignments: any[]) => {
    setLoadingLevels(true);
    
    try {
      // Get unique level IDs to avoid duplicate calls
      const uniqueLevelIds = [...new Set(assignments.map(item => item.levelId))];
      
      // Fetch all level details in parallel
      const levelPromises = uniqueLevelIds.map(async (levelId) => {
        try {
          const levelData = await getLevel(levelId.toString()).unwrap();
          return { id: levelId, data: levelData };
        } catch (error) {
          console.error(`Error fetching level ${levelId}:`, error);
          return { 
            id: levelId, 
            data: { 
              name: `Level ${levelId}`, 
              description: Strings.ciltMstrNA 
            } 
          };
        }
      });

      const levelResults = await Promise.all(levelPromises);
      
      // Create a map for quick lookup
      const levelMap = new Map();
      levelResults.forEach(result => {
        levelMap.set(result.id, result.data);
      });

      // Process the assignment data with level details
      const processed = assignments.map((item: any) => {
        const levelData = levelMap.get(item.levelId) || {};
        
        return {
          id: item.id,
          positionName: item.position?.name || Strings.ciltMstrNA,
          positionDescription: item.position?.description || Strings.ciltMstrNA,
          areaName: item.position?.areaName || Strings.ciltMstrNA,
          levelId: item.levelId,
          levelName: levelData.name || `Level ${item.levelId}`,
          levelDescription: levelData.description || Strings.ciltMstrNA,
          nodeResponsableName: item.position?.nodeResponsableName || Strings.noResponsible,
          status: item.status || 'A',
          createdAt: item.createdAt || '',
        };
      });

      setProcessedData(processed);
    } catch (error) {
      console.error('Error fetching level details:', error);
      // Fallback: show data without level details
      const processed = assignments.map((item: any) => ({
        id: item.id,
        positionName: item.position?.name || Strings.ciltMstrNA,
        positionDescription: item.position?.description || Strings.ciltMstrNA,
        areaName: item.position?.areaName || Strings.ciltMstrNA,
        levelId: item.levelId,
        levelName: `Level ${item.levelId}`,
        levelDescription: Strings.ciltMstrNA,
        nodeResponsableName: item.position?.nodeResponsableName || Strings.noResponsible,
        status: item.status || 'A',
        createdAt: item.createdAt || '',
      }));
      setProcessedData(processed);
    } finally {
      setLoadingLevels(false);
    }
  };

  const columns: ColumnsType<PositionLevelData> = [
    {
      title: Strings.positionName,
      dataIndex: 'positionName',
      key: 'positionName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.areaName}
          </Text>
        </div>
      ),
      width: 200,
    },
    {
      title: Strings.description,
      dataIndex: 'positionDescription',
      key: 'positionDescription',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <Text>{text}</Text>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: Strings.levelName,
      dataIndex: 'levelName',
      key: 'levelName',
      width: 150,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.levelDescription}
          </Text>
        </div>
      ),
    },
    {
      title: Strings.responsible,
      dataIndex: 'nodeResponsableName',
      key: 'nodeResponsableName',
      width: 140,
      render: (name) => <Text>{name}</Text>,
    },
    {
      title: Strings.creationDate,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : Strings.ciltMstrNA,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  const renderContent = () => {
    if (isLoading || loadingLevels) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>
              {isLoading ? `${Strings.loading}...` : 'Cargando detalles de niveles...'}
            </Text>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="danger">{Strings.errorLoadingData}</Text>
        </div>
      );
    }

    if (!processedData || processedData.length === 0) {
      return (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={Strings.ciltPositionsLevelsNoData}
        />
      );
    }

    return (
      <div>
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
                {cilt?.ciltName || Strings.ciltMstrNA}
              </Title>
              <Text type="secondary">
                {Strings.total}: {processedData.length} {Strings.ciltPositionsLevelsAssignments}
              </Text>
            </div>
            <Badge 
              count={processedData.length} 
              style={{ backgroundColor: '#52c41a' }}
              showZero
            />
          </div>
        </Card>

        <Table
          columns={columns}
          dataSource={processedData}
          rowKey="id"
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['8', '15', '25', '50'],
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} ${Strings.ciltPositionsLevelsAssignments}`,
          }}
          scroll={{ x: 800 }}
          size="small"
          bordered
        />
      </div>
    );
  };

  return (
    <Modal
      title={`${Strings.ciltPositionsLevelsTitle} - ${cilt?.ciltName || ''}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      destroyOnClose
    >
      {renderContent()}
    </Modal>
  );
};

export default CiltPositionsLevelsModal; 