import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Table, Typography, Spin, Card, Empty, Tooltip, Button, Input, Pagination } from 'antd';
import { SearchOutlined} from '@ant-design/icons';
import { CiltMstr } from '../../../data/cilt/ciltMstr/ciltMstr';
import { useGetCiltMstrPositionLevelsByCiltMstrIdQuery } from '../../../services/cilt/assignaments/ciltMstrPositionsLevelsService';
import { useGetlevelMutation } from '../../../services/levelService';
import { useGetSchedulesBySequenceQuery } from '../../../services/cilt/ciltSecuencesScheduleService';
import Strings from '../../../utils/localizations/Strings';
import type { ColumnsType } from 'antd/es/table';
import ViewSchedulesModal from '../../ciltLevelAssignments/components/ViewSchedulesModal';

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
  ciltMstr?: ExtendedCiltMstr;
}

// Extended interface for CiltMstr that includes sequences
interface ExtendedCiltMstr extends CiltMstr {
  sequences?: CiltSequence[];
}

// Interface for sequence data structure from API response
interface CiltSequence {
  id: number;
  siteId?: number;
  siteName?: string;
  areaId?: number;
  areaName?: string;
  positionId?: number;
  positionName?: string;
  ciltMstrId?: number;
  ciltMstrName?: string;
  levelId?: number | null;
  levelName?: string | null;
  route?: string | null;
  order?: number;
  secuenceList: string;
  secuenceColor: string;
  ciltTypeId?: number;
  ciltTypeName: string;
  referenceOplSop?: number;
  standardTime: number;
  standardOk: string;
  remediationOplSop?: number;
  toolsRequired: string | null;
  specialWarning: string | null;
  stoppageReason?: number;
  machineStopped: number;
  quantityPicturesCreate?: number;
  quantityPicturesClose?: number;
  referencePoint?: string | null;
  selectableWithoutProgramming?: boolean | null;
  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  status: string;
}

const { Text } = Typography;

// Component for the schedule button
interface ScheduleButtonProps {
  sequence: CiltSequence;
  onViewSchedules: (_sequence: CiltSequence) => void;
}

const ScheduleButton = ({ sequence, onViewSchedules }: ScheduleButtonProps) => {
  const { data: schedules = [], isLoading } = useGetSchedulesBySequenceQuery(sequence.id, {
    refetchOnMountOrArgChange: true,
    skip: !sequence.id
  });

  if (isLoading) {
    return <Button type="default" loading size="small">{Strings.viewSchedules}</Button>;
  }

  if (!schedules.length) {
    return <Button type="default" disabled size="small">{Strings.noSchedulesFound}</Button>;
  }

  return (
    <Button 
      type="default" 
      size="small"
      onClick={() => onViewSchedules(sequence)}
    >
      {Strings.viewSchedules}
    </Button>
  );
};

const CiltPositionsLevelsModal: React.FC<CiltPositionsLevelsModalProps> = ({
  visible,
  cilt,
  onCancel,
}) => {
  const [processedData, setProcessedData] = useState<PositionLevelData[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  
  // States for sequence modals
  const [selectedCiltMstr, setSelectedCiltMstr] = useState<ExtendedCiltMstr | null>(null);
  const [sequenceListModalVisible, setSequenceListModalVisible] = useState(false);
  const [sequenceSearchText, setSequenceSearchText] = useState("");
  const [sequencePage, setSequencePage] = useState(1);
  const [viewSchedulesVisible, setViewSchedulesVisible] = useState(false);
  const [selectedSequenceForViewSchedules, setSelectedSequenceForViewSchedules] = useState<CiltSequence | null>(null);
  const sequencePageSize = 4;

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
          ciltMstr: item.ciltMstr,
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
        ciltMstr: item.ciltMstr,
      }));
      setProcessedData(processed);
    } finally {
      setLoadingLevels(false);
    }
  };

  // Functions to handle sequence modals
  const showSequenceList = (ciltMstr: ExtendedCiltMstr) => {
    setSelectedCiltMstr(ciltMstr);
    setSequenceListModalVisible(true);
  };

  const showViewSchedules = (sequence: CiltSequence) => {
    setSelectedSequenceForViewSchedules(sequence);
    setViewSchedulesVisible(true);
  };

  const handleViewSchedulesCancel = () => {
    setViewSchedulesVisible(false);
    setSelectedSequenceForViewSchedules(null);
  };

  // Helper function to get paginated items
  const getPaginatedItems = (items: any[] = [], page: number, size: number) => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return items.slice(startIndex, endIndex);
  };

  // Get active sequences for the selected CILT master
  const activeSequences = useMemo(() => {
    if (!selectedCiltMstr?.sequences) return [];
    return selectedCiltMstr.sequences.filter((seq: CiltSequence) => seq.status === 'A');
  }, [selectedCiltMstr]);
  
  // Filter sequences based on search text
  const filteredSequences = useMemo(() => {
    if (!sequenceSearchText.trim()) {
      return activeSequences;
    }
    
    const searchLower = sequenceSearchText.toLowerCase();
    return activeSequences.filter((sequence: CiltSequence) => {
      const sequenceText = sequence.secuenceList.toLowerCase();
      const typeText = sequence.ciltTypeName.toLowerCase();
      return sequenceText.includes(searchLower) || typeText.includes(searchLower);
    });
  }, [activeSequences, sequenceSearchText]);

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
      width: 100,
      render: (name) => <Text>{name}</Text>,
    },
    {
      title: Strings.actions,
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {record.ciltMstr?.sequences && record.ciltMstr.sequences.length > 0 ? (
            <Button 
              type="primary" 
              size="small"
              onClick={() => showSequenceList(record.ciltMstr!)}
            >
              {Strings.viewSequences}
            </Button>
          ) : (
            <Button 
              type="default" 
              size="small"
              disabled
            >
              {Strings.noSequencesFound}
            </Button>
          )}
        </div>
      ),
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
        <Table
          columns={columns}
          dataSource={processedData}
          rowKey="id"
          pagination={{
            pageSize: 50,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} ${Strings.ciltPositionsLevelsAssignments}`,
          }}
          scroll={{ x: 1000 }}
          size="small"
          bordered
        />
      </div>
    );
  };

  return (
    <>
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
      
      {/* Sequence List Modal */}
      <Modal
        title={<div style={{ whiteSpace: 'pre-wrap', paddingRight: '24px' }}>{`${Strings.sequences}: ${selectedCiltMstr?.ciltName || ''}`}</div>}
        open={sequenceListModalVisible}
        onCancel={() => setSequenceListModalVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
        zIndex={1050}
      >
        {activeSequences.length > 0 ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder={Strings.ciltCardListSearchPlaceholder}
                prefix={<SearchOutlined />}
                value={sequenceSearchText}
                onChange={(e) => {
                  setSequenceSearchText(e.target.value);
                  setSequencePage(1); 
                }}
                allowClear
              />
            </div>
            
            {filteredSequences.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {getPaginatedItems(filteredSequences, sequencePage, sequencePageSize).map((sequence: CiltSequence) => (
                    <div key={sequence.id} style={{ width: '80%', marginBottom: '16px' }}>
                      <Card
                        style={{ 
                          paddingTop: '16px',
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
                          border: '1px solid #e8e8e8',
                          width: '100%'
                        }}
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: '16px', 
                                height: '16px', 
                                borderRadius: '50%', 
                                backgroundColor: `#${sequence.secuenceColor || '000000'}`,
                                flexShrink: 0
                              }} 
                            />
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap' }}>
                              {sequence.secuenceList}
                            </div>
                          </div>
                        }
                      >
                        <div className="mb-2">
                          <Text strong>{Strings.ciltTypeName}: </Text>
                          <Text>{sequence.ciltTypeName}</Text>
                        </div>
                        <div className="mb-2">
                          <Text strong>{Strings.standardTime}: </Text>
                          <Text>{Math.floor(sequence.standardTime / 60)}:{(sequence.standardTime % 60).toString().padStart(2, '0')} min</Text>
                        </div>
                        <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <ScheduleButton sequence={sequence} onViewSchedules={showViewSchedules} />
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Pagination
                    current={sequencePage}
                    pageSize={sequencePageSize}
                    total={filteredSequences.length}
                    onChange={setSequencePage}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <Empty description={Strings.noSequencesFound} />
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            <Text>{Strings.noSequencesFound}</Text>
          </div>
        )}
      </Modal>

      {/* View Schedules Modal */}
      {selectedSequenceForViewSchedules && (
        <ViewSchedulesModal
          visible={viewSchedulesVisible}
          onCancel={handleViewSchedulesCancel}
          sequenceId={selectedSequenceForViewSchedules.id}
          sequenceName={selectedSequenceForViewSchedules.secuenceList}
          zIndex={1100}
        />
      )}
    </>
  );
};

export default CiltPositionsLevelsModal; 