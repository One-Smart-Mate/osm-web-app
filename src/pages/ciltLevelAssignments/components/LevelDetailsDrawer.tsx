
import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  Button,
  Typography,
  Space,
  Tabs,
  Spin,
  Card,
  Row,
  Col,
  Pagination,
  Modal,
  Badge,
  Descriptions,
  Image,
  Empty,
  Input,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Strings from "../../../utils/localizations/Strings";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";


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

interface LevelDetailsDrawerProps {
  visible: boolean;
  levelId: number | null;
  levelName: string | null;
  onClose: () => void;
}

const LevelDetailsDrawer: React.FC<LevelDetailsDrawerProps> = ({
  visible,
  levelId,
  levelName,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("cilt");
  const [searchText, setSearchText] = useState("");
  const [selectedCiltMstr, setSelectedCiltMstr] = useState<ExtendedCiltMstr | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(null);
  const [ciltDetailsModalVisible, setCiltDetailsModalVisible] = useState(false);
  const [sequenceListModalVisible, setSequenceListModalVisible] = useState(false);
  const [singleSequenceModalVisible, setSingleSequenceModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sequenceSearchText, setSequenceSearchText] = useState("");
  const [sequencePage, setSequencePage] = useState(1);
  const pageSize = 4;
  const sequencePageSize = 4;

  const [levelAssignments, setLevelAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!levelId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const apiUrl = `${import.meta.env.VITE_API_SERVICE}/cilt-mstr-position-levels/level/${levelId}?skipOpl=true`;
        console.log('Fetching from URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        const assignments = data.data || data;
        setLevelAssignments(Array.isArray(assignments) ? assignments : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [levelId]);
  
  console.log('LevelDetailsDrawer - levelId:', levelId);
  console.log('LevelDetailsDrawer - levelAssignments:', levelAssignments);
  
  interface ExtendedCiltMstr extends CiltMstr {
    sequences?: CiltSequence[];
  }

  
  const showCiltDetails = (ciltMstr: CiltMstr) => {
    setSelectedCiltMstr(ciltMstr);
    setCiltDetailsModalVisible(true);
  };

  const showSequenceList = (ciltMstr: CiltMstr) => {
    setSelectedCiltMstr(ciltMstr);
    setSequenceListModalVisible(true);
  };
    
  // Show details of a specific sequence
  const showSequenceDetails = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setSingleSequenceModalVisible(true);
  };

  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return url.startsWith('/') ? `https:${url}` : `https://${url}`;
  };

  // Helper function to get paginated items - used by both main component and sequence modal
  const getPaginatedItems = (items: any[] = [], page: number, size: number) => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return items.slice(startIndex, endIndex);
  };

  // Filter assignments based on search text and active status
  const filteredAssignments = useMemo(() => {
    // First filter by active status
    const activeAssignments = levelAssignments.filter(assignment => assignment.status === 'A');
    
    // Then filter by search text if provided
    if (!searchText.trim()) {
      return activeAssignments;
    }
    
    const searchLower = searchText.toLowerCase();
    return activeAssignments.filter(assignment => {
      const ciltName = assignment.ciltMstr?.ciltName?.toLowerCase() || '';
      const ciltDescription = assignment.ciltMstr?.ciltDescription?.toLowerCase() || '';
      
      return ciltName.includes(searchLower) || ciltDescription.includes(searchLower);
    });
  }, [levelAssignments, searchText]);

  const renderCiltProcedures = () => {
    if (isLoading) return <Spin size="large" />;
    if (error) {
      console.error('Error rendering CILT procedures:', error);
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {Strings.errorLoadingData}
                <br />
                <small style={{ color: 'gray' }}>Error en la base de datos: Columna 'reference_opl_sop' no encontrada</small>
              </span>
            }
          />
        </div>
      );
    }
    
    // Show empty state for no assignments or no search results
    if (!filteredAssignments || filteredAssignments.length === 0) {
      return <Empty description={searchText ? 'No se encontraron resultados para tu búsqueda' : Strings.noCiltProceduresAssigned} />;
    }
    
    const paginatedData = getPaginatedItems(filteredAssignments, currentPage, pageSize);
    
    return (
      <div>
        {/* Single column layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {paginatedData.map((assignment: any) => (
            <Card
              key={assignment.id}
              style={{ 
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e8e8e8'
              }}
              title={
                <div>
                  <Text strong>{assignment.ciltMstr?.ciltName}</Text>
                </div>
              }
              extra={null}
              bodyStyle={{ padding: '16px', width: '100%' }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' }}>
                {/* Image column */}
                {assignment.ciltMstr?.urlImgLayout && (
                  <div style={{ flex: '0 0 180px' }}>
                    <Image
                      src={getImageUrl(assignment.ciltMstr.urlImgLayout)}
                      alt="Layout"
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px' }}
                      preview={{ src: getImageUrl(assignment.ciltMstr.urlImgLayout) }}
                    />
                  </div>
                )}
                
                {/* Content column - expanded to use more space */}
                <div style={{ flex: '1 1 auto', width: 'calc(100% - 200px)' }}>
                  <p><strong>{Strings.description}:</strong> {assignment.ciltMstr?.ciltDescription}</p>
                  <p><strong>{Strings.standardTime}:</strong> {assignment.ciltMstr?.standardTime} min</p>
                  <p><strong>{Strings.sequences}:</strong> {assignment.ciltMstr?.sequences?.length || 0}</p>
                  
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <Button 
                      type="primary" 
                      onClick={() => showCiltDetails(assignment.ciltMstr)}
                    >
                      Ver detalles
                    </Button>
                    
                    {assignment.ciltMstr?.sequences && assignment.ciltMstr.sequences.length > 0 && (
                      <Button 
                        type="primary" 
                        onClick={() => showSequenceList(assignment.ciltMstr)}
                      >
                        {Strings.viewSequences}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Pagination */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredAssignments.length}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  const renderPositions = () => {
    if (isLoading) return <Spin size="large" />;
    if (error) {
      console.error('Error rendering CILT procedures:', error);
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {Strings.errorLoadingData}
                <br />
                <small style={{ color: 'gray' }}>Error en la base de datos: Columna 'reference_opl_sop' no encontrada</small>
              </span>
            }
          />
        </div>
      );
    }
    if (!levelAssignments || levelAssignments.length === 0) {
      return <Empty description={Strings.noPositionsAssigned} />;
    }
    
    const positionAssignments = levelAssignments.filter(assignment => 'position' in assignment && assignment.position);
    
    const paginatedData = getPaginatedItems(positionAssignments, currentPage, pageSize);
    
    if (paginatedData.length === 0) {
      return <Empty description={Strings.noPositionsAssigned} />;
    }
    
    return (
      <div>
        <Row gutter={[16, 16]}>
          {paginatedData.map((assignment: any) => (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={assignment.id}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{assignment.position?.name}</Text>
                    <Badge
                      status={assignment.status === 'A' ? 'success' : 'error'}
                      text={assignment.status === 'A' ? Strings.active : Strings.inactive}
                    />
                  </div>
                }
              >
                <p><strong>{Strings.site}:</strong> {assignment.position?.siteName} ({assignment.position?.siteType})</p>
                <p><strong>{Strings.area}:</strong> {assignment.position?.areaName}</p>
                <p><strong>{Strings.level}:</strong> {assignment.position?.levelName}</p>
                <p><strong>{Strings.description}:</strong> {assignment.position?.description}</p>
                <p><strong>Ruta:</strong> {assignment.position?.route || 'N/A'}</p>
              </Card>
            </Col>
          ))}
        </Row>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={positionAssignments.length}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  const renderOplSop = () => {
    if (isLoading) return <Spin size="large" />;
    if (error) {
      console.error('Error rendering CILT procedures:', error);
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {Strings.errorLoadingData}
                <br />
                <small style={{ color: 'gray' }}>Error en la base de datos: Columna 'reference_opl_sop' no encontrada</small>
              </span>
            }
          />
        </div>
      );
    }
    
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Text>{Strings.functionalityInDevelopment}</Text>
      </div>
    );
  };

  const renderCiltDetailsModal = () => {
    if (!selectedCiltMstr) return null;

    return (
      <Modal
        title={`${Strings.ciltDetails}: ${selectedCiltMstr.ciltName}`}
        open={ciltDetailsModalVisible}
        onCancel={() => setCiltDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {selectedCiltMstr.urlImgLayout && (
              <div className="text-center mb-4">
                <Text strong>{Strings.layoutImage}</Text>
                <div className="mt-2">
                  <Image
                    src={getImageUrl(selectedCiltMstr.urlImgLayout)}
                    alt={selectedCiltMstr.ciltName || "CILT Layout"}
                    style={{ maxHeight: "300px" }}
                    fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
                  />
                </div>
              </div>
            )}
          </Col>
          <Col span={24}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={Strings.ciltMstrNameLabel}>
                {selectedCiltMstr.ciltName}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.ciltMstrListDescriptionColumn}>
                {selectedCiltMstr.ciltDescription || "-"}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.ciltMstrListCreatorColumn}>
                {selectedCiltMstr.creatorName || "-"}
              </Descriptions.Item>
              {selectedCiltMstr.reviewerName && (
                <Descriptions.Item label={Strings.ciltMstrReviewerLabel}>
                  {selectedCiltMstr.reviewerName}
                </Descriptions.Item>
              )}
              {selectedCiltMstr.approvedByName && (
                <Descriptions.Item label={Strings.ciltMstrApproverLabel}>
                  {selectedCiltMstr.approvedByName}
                </Descriptions.Item>
              )}
              {selectedCiltMstr.standardTime !== null && (
                <Descriptions.Item label={Strings.ciltMstrDetailsStandardTimeLabel}>
                  {selectedCiltMstr.standardTime}
                </Descriptions.Item>
              )}
              {selectedCiltMstr.dateOfLastUsed && (
                <Descriptions.Item label={Strings.ciltMstrLastUsedLabel}>
                  {new Date(selectedCiltMstr.dateOfLastUsed).toLocaleDateString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={Strings.status}>
                <Badge
                  status={selectedCiltMstr.status === "A" ? "success" : "error"}
                  text={
                    selectedCiltMstr.status === "A"
                      ? Strings.ciltMstrListActiveFilter
                      : Strings.ciltMstrListSuspendedFilter
                  }
                />
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Modal>
    );
  };

  // Get active sequences for the selected CILT master
  const activeSequences = useMemo(() => {
    if (!selectedCiltMstr?.sequences) return [];
    return selectedCiltMstr.sequences.filter(seq => seq.status === 'A');
  }, [selectedCiltMstr]);
  
  // Filter sequences based on search text
  const filteredSequences = useMemo(() => {
    if (!sequenceSearchText.trim()) {
      return activeSequences;
    }
    
    const searchLower = sequenceSearchText.toLowerCase();
    return activeSequences.filter(sequence => {
      const sequenceText = sequence.secuenceList.toLowerCase();
      const typeText = sequence.ciltTypeName.toLowerCase();
      return sequenceText.includes(searchLower) || typeText.includes(searchLower);
    });
  }, [activeSequences, sequenceSearchText]);
  
  const renderSequenceListModal = () => {
    if (!selectedCiltMstr) return null;
    
    const paginatedData = getPaginatedItems(filteredSequences, sequencePage, sequencePageSize);

    return (
      <Modal
        title={`${Strings.sequences}: ${selectedCiltMstr.ciltName}`}
        open={sequenceListModalVisible}
        onCancel={() => setSequenceListModalVisible(false)}
        footer={null}
        width={800}
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
                <Row gutter={[16, 16]}>
                  {paginatedData.map((sequence: CiltSequence) => (
                    <Col xs={24} sm={24} md={12} key={sequence.id}>
                      <Card
                        style={{ 
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
                          border: '1px solid #e8e8e8',
                          marginBottom: '8px'
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
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sequence.secuenceList}
                            </div>
                          </div>
                        }
                        extra={
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => showSequenceDetails(sequence)}
                          >
                            {Strings.details}
                          </Button>
                        }
                      >
                        <div className="mb-2">
                          <Text strong>{Strings.ciltTypeName}: </Text>
                          <Text>{sequence.ciltTypeName}</Text>
                        </div>
                        <div className="mb-2">
                          <Text strong>{Strings.standardTime}: </Text>
                          <Text>{sequence.standardTime} min</Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
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
    );
  };

  const renderSingleSequenceDetailsModal = () => {
    if (!selectedSequence) return null;

    return (
      <Modal
        title={`${Strings.sequenceDetails}`}
        open={singleSequenceModalVisible}
        onCancel={() => setSingleSequenceModalVisible(false)}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={Strings.sequence}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: `#${selectedSequence.secuenceColor || '000000'}`,
                  flexShrink: 0
                }} 
              />
              <span>{selectedSequence.secuenceList}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label={Strings.ciltTypeName}>
            {selectedSequence.ciltTypeName}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.standardTime}>
            {selectedSequence.standardTime} min
          </Descriptions.Item>
          <Descriptions.Item label={Strings.standardOk}>
            {selectedSequence.standardOk}
          </Descriptions.Item>
          {selectedSequence.toolsRequired && (
            <Descriptions.Item label={Strings.toolsRequired}>
              {selectedSequence.toolsRequired}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={Strings.machineStopped}>
            {selectedSequence.machineStopped ? Strings.yes : Strings.no}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.status}>
            <Badge
              status={selectedSequence.status === "A" ? "success" : "error"}
              text={
                selectedSequence.status === "A"
                  ? Strings.ciltMstrListActiveFilter
                  : Strings.ciltMstrListSuspendedFilter
              }
            />
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  const renderSearchBar = () => (
    <div style={{ marginBottom: '16px' }}>
      <Input
        placeholder={Strings.searchCiltMstr}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setCurrentPage(1); 
        }}
        allowClear
      />
    </div>
  );

  return (
    <>
      <Drawer
        title={`${Strings.details}: ${levelName || Strings.level}`}
        placement="right"
        width={800}
        onClose={onClose}
        open={visible}
        extra={
          <Space>
            <Button onClick={onClose}>{Strings.close}</Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'cilt',
              label: Strings.ciltProcedures,
              children: (
                <>
                  {renderSearchBar()}
                  {renderCiltProcedures()}
                </>
              )
            },
            {
              key: 'positions',
              label: Strings.positions,
              children: renderPositions()
            },
            {
              key: 'opl',
              label: 'OPL/SOP',
              children: renderOplSop()
            }
          ]}
        />
      </Drawer>

      {renderCiltDetailsModal()}
      {renderSequenceListModal()}
      {renderSingleSequenceDetailsModal()}
    </>
  );
};

export default LevelDetailsDrawer;
