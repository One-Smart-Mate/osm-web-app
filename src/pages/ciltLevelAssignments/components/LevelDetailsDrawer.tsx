
import React, { useState, useEffect } from "react";
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
} from "antd";
import Strings from "../../../utils/localizations/Strings";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { Position } from "../../../data/postiions/positions";

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
// Tabs ahora usa items en lugar de TabPane

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
  // Estados para los modales
  const [selectedCiltMstr, setSelectedCiltMstr] = useState<ExtendedCiltMstr | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(null);
  const [ciltDetailsModalVisible, setCiltDetailsModalVisible] = useState(false);
  const [sequenceDetailsModalVisible, setSequenceDetailsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Estado para almacenar los datos obtenidos directamente
  const [levelAssignments, setLevelAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Efecto para cargar los datos cuando cambia el levelId
  useEffect(() => {
    const fetchData = async () => {
      if (!levelId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Usar fetch directamente en lugar de RTK Query
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
        
        // Extraer los datos si están envueltos en una propiedad data
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
  
  // Log para depuración
  console.log('LevelDetailsDrawer - levelId:', levelId);
  console.log('LevelDetailsDrawer - levelAssignments:', levelAssignments);
  
  // Extender el objeto CiltMstr para incluir secuencias
  interface ExtendedCiltMstr extends CiltMstr {
    sequences?: CiltSequence[];
  }
  
  // Define the type for the API response data
  type CiltMstrPositionLevelResponse = {
    id: number;
    siteId: string | number;
    ciltMstrId: number;
    positionId: number;
    levelId: string | number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    position?: Position;
    ciltMstr?: ExtendedCiltMstr;
  };

  // Función para mostrar los detalles de un CILT
  const showCiltDetails = (ciltMstr: CiltMstr) => {
    setSelectedCiltMstr(ciltMstr);
    setCiltDetailsModalVisible(true);
  };

  // Función para mostrar los detalles de una secuencia
  const showSequenceDetails = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setSequenceDetailsModalVisible(true);
  };

  // Función para formatear URLs de imágenes
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return url.startsWith('/') ? `https:${url}` : `https://${url}`;
  };

  // Calcular el rango de elementos a mostrar en la página actual
  const getPageItems = (items: any[] = []) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  };

  // Renderizar las tarjetas de procedimientos CILT
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
    if (!levelAssignments || levelAssignments.length === 0) {
      return <Empty description={Strings.noCiltProceduresAssigned} />;
    }
    
    // Calcular el rango de elementos a mostrar en la página actual
    const paginatedData = getPageItems(levelAssignments);
    
    return (
      <div>
        <Row gutter={[16, 16]}>
          {paginatedData.map((assignment) => (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={assignment.id}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{assignment.ciltMstr?.ciltName}</Text>
                    <Badge
                      status={assignment.status === 'A' ? 'success' : 'error'}
                      text={assignment.status === 'A' ? Strings.active : Strings.inactive}
                    />
                  </div>
                }
                extra={<Button type="link" onClick={() => showCiltDetails(assignment.ciltMstr)}>{Strings.viewDetails}</Button>}
              >
                <p><strong>{Strings.description}:</strong> {assignment.ciltMstr?.ciltDescription}</p>
                <p><strong>{Strings.standardTime}:</strong> {assignment.ciltMstr?.standardTime} min</p>
                <p><strong>{Strings.sequences}:</strong> {assignment.ciltMstr?.sequences?.length || 0}</p>
                
                {assignment.ciltMstr?.sequences && assignment.ciltMstr.sequences.length > 0 && (
                  <div>
                    <Text strong>{Strings.sequences}:</Text>
                    <ul>
                      {assignment.ciltMstr.sequences.slice(0, 2).map((sequence: CiltSequence) => (
                        <li key={sequence.id}>
                          <Button 
                            type="link" 
                            style={{ padding: 0 }}
                            onClick={() => showSequenceDetails(sequence)}
                          >
                            {sequence.secuenceList.length > 30 ? `${sequence.secuenceList.substring(0, 30)}...` : sequence.secuenceList}
                          </Button>
                        </li>
                      ))}
                      {assignment.ciltMstr.sequences.length > 2 && (
                        <li>
                          <Text type="secondary">{Strings.andMore} {assignment.ciltMstr.sequences.length - 2} {Strings.more}...</Text>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {assignment.ciltMstr?.urlImgLayout && (
                  <div style={{ marginTop: '10px' }}>
                    <Image
                      src={getImageUrl(assignment.ciltMstr.urlImgLayout)}
                      alt="Layout"
                      style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                      preview={{ src: getImageUrl(assignment.ciltMstr.urlImgLayout) }}
                    />
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={levelAssignments.length}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  };

  // Renderizar las tarjetas de posiciones
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
    
    // Filtrar asignaciones que tienen datos de posición
    const positionAssignments = levelAssignments.filter(assignment => 'position' in assignment && assignment.position);
    
    // Calcular el rango de elementos a mostrar en la página actual
    const paginatedData = getPageItems(positionAssignments);
    
    if (paginatedData.length === 0) {
      return <Empty description={Strings.noPositionsAssigned} />;
    }
    
    return (
      <div>
        <Row gutter={[16, 16]}>
          {paginatedData.map((assignment) => (
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

  // Renderizar el contenido de OPL/SOP (en desarrollo)
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

  // Modal de detalles de CILT
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
              <Descriptions.Item label="ID">
                {selectedCiltMstr.id}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.ciltMstrListDescriptionColumn}>
                {selectedCiltMstr.ciltDescription || "-"}
              </Descriptions.Item>
              <Descriptions.Item label={Strings.ciltMstrListCreatorColumn}>
                {selectedCiltMstr.creatorName || "-"}
              </Descriptions.Item>
              {selectedCiltMstr.reviewerName && (
                <Descriptions.Item label="Reviewer">
                  {selectedCiltMstr.reviewerName}
                </Descriptions.Item>
              )}
              {selectedCiltMstr.approvedByName && (
                <Descriptions.Item label="Approved By">
                  {selectedCiltMstr.approvedByName}
                </Descriptions.Item>
              )}
              {selectedCiltMstr.standardTime !== null && (
                <Descriptions.Item label="Standard Time">
                  {selectedCiltMstr.standardTime}
                </Descriptions.Item>
              )}
              {selectedCiltMstr.dateOfLastUsed && (
                <Descriptions.Item label="Last Used">
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

  // Modal de detalles de secuencias
  const renderSequenceDetailsModal = () => {
    if (!selectedCiltMstr) return null;

    return (
      <Modal
        title={`${Strings.sequences}: ${selectedCiltMstr.ciltName}`}
        open={sequenceDetailsModalVisible}
        onCancel={() => setSequenceDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCiltMstr.sequences && selectedCiltMstr.sequences.length > 0 ? (
          <div>
            <Row gutter={[16, 16]}>
              {selectedCiltMstr.sequences.map((sequence: CiltSequence) => (
                <Col xs={24} sm={24} md={12} key={sequence.id}>
                  <Card
                    title={
                      <div style={{ color: `#${sequence.secuenceColor || '000000'}` }}>
                        {sequence.secuenceList}
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
                    <div>
                      <Text strong>{Strings.status}: </Text>
                      <Badge
                        status={sequence.status === "A" ? "success" : "error"}
                        text={
                          sequence.status === "A"
                            ? Strings.ciltMstrListActiveFilter
                            : Strings.ciltMstrListSuspendedFilter
                        }
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          <div className="text-center p-4">
            <Text>{Strings.noSequencesFound}</Text>
          </div>
        )}
      </Modal>
    );
  };

  // Modal de detalles de una secuencia específica
  const renderSingleSequenceDetailsModal = () => {
    if (!selectedSequence) return null;

    return (
      <Modal
        title={`${Strings.sequenceDetails}`}
        open={sequenceDetailsModalVisible}
        onCancel={() => setSequenceDetailsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={Strings.sequence}>
            <div style={{ color: `#${selectedSequence.secuenceColor || '000000'}` }}>
              {selectedSequence.secuenceList}
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
              children: renderCiltProcedures()
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
      {renderSequenceDetailsModal()}
      {renderSingleSequenceDetailsModal()}
    </>
  );
};

export default LevelDetailsDrawer;
