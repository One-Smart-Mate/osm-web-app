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
  notification,
  List,
} from "antd";
import { SearchOutlined, FileOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import ViewSchedulesModal from "./ViewSchedulesModal";
import Strings from "../../../utils/localizations/Strings";
import { CiltMstr } from "../../../data/cilt/ciltMstr/ciltMstr";
import { useGetOplLevelsByLevelIdQuery, useDeleteOplLevelMutation } from "../../../services/cilt/assignaments/oplLevelService";
import { useGetPositionUsersQuery } from "../../../services/positionService";
import { useGetSchedulesBySequenceQuery } from "../../../services/cilt/ciltSecuencesScheduleService";
import { useDeleteCiltMstrPositionLevelMutation, useGetCiltMstrPositionLevelsByLevelIdQuery } from "../../../services/cilt/assignaments/ciltMstrPositionsLevelsService";
import { useGetOplTypesMutation } from "../../../services/oplTypesService";
import AnatomyNotification from "../../components/AnatomyNotification";
import { Responsible } from "../../../data/user/user";
import ScheduleSecuence from "../../cilt/components/ScheduleSecuence";
import { CiltMstrPositionLevelWithRelations } from "../../../data/cilt/assignaments/ciltMstrPositionsLevels";


// Extended interface for OPL with details from API response
interface ExtendedOplLevel {
  id: number;
  oplLevelId: number;
  title: string;
  objetive: string;
  creatorId: number;
  creatorName: string;
  siteId: number;
  reviewerId: number;
  reviewerName: string;
  oplTypeId: number; // Changed from oplType: string to oplTypeId: number
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  details: Array<{
    id: number;
    oplId: number;
    order: number;
    type: string;
    text: string;
    mediaUrl: string;
    updatedAt: string;
  }>;
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

// Componente para el botón de calendarizaciones
interface ScheduleButtonProps {
  sequence: CiltSequence;
  onViewSchedules: (_sequence: CiltSequence) => void;
  refreshKey?: number; // Add refresh key prop
}

const ScheduleButton = ({ sequence, onViewSchedules, refreshKey }: ScheduleButtonProps) => {
  const { data: schedules = [], isLoading, refetch } = useGetSchedulesBySequenceQuery(sequence.id, {
    refetchOnMountOrArgChange: true,
    skip: !sequence.id
  });

  // Refetch schedules when refreshKey changes
  React.useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  if (isLoading) {
    return <Button type="default" loading>{Strings.viewSchedules}</Button>;
  }

  if (!schedules.length) {
    return <Button type="default" disabled>{Strings.noSchedulesFound}</Button>;
  }

  return (
    <Button 
      type="default" 
      onClick={() => onViewSchedules(sequence)}
    >
      {Strings.viewSchedules}
    </Button>
  );
};

// Componente para mostrar los usuarios de una posición
const PositionUsers = ({ positionId }: { positionId: string }) => {
  const { data: users = [], isLoading } = useGetPositionUsersQuery(positionId, {
    refetchOnMountOrArgChange: true
  });

  if (isLoading) {
    return <Spin size="small" />;
  }

  if (!users.length) {
    return <Text type="secondary">{Strings.noAssignedUsers || "No hay usuarios asignados"}</Text>;
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
  const [selectedCiltMstr, setSelectedCiltMstr] = useState<(CiltMstr & { sequences?: any[] }) | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(null);
  const [ciltDetailsModalVisible, setCiltDetailsModalVisible] = useState(false);
  const [sequenceListModalVisible, setSequenceListModalVisible] = useState(false);
  const [scheduleSecuenceVisible, setScheduleSecuenceVisible] = useState(false);
  const [selectedSequenceForSchedule, setSelectedSequenceForSchedule] = useState<CiltSequence | null>(null);
  const [viewSchedulesVisible, setViewSchedulesVisible] = useState(false);
  const [selectedSequenceForViewSchedules, setSelectedSequenceForViewSchedules] = useState<CiltSequence | null>(null);
  const [singleSequenceModalVisible, setSingleSequenceModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sequenceSearchText, setSequenceSearchText] = useState("");
  const [sequencePage, setSequencePage] = useState(1);
  const [refreshSchedules, setRefreshSchedules] = useState(0); // Force refresh counter for schedules
  const pageSize = 4;
  const sequencePageSize = 4;

  const [deleteCiltAssignment, { isLoading: isDeleting }] = useDeleteCiltMstrPositionLevelMutation();
  const [deleteOplLevel, { isLoading: isDeletingOpl }] = useDeleteOplLevelMutation();
  const [getOplTypes] = useGetOplTypesMutation();
  const [oplTypesMap, setOplTypesMap] = useState<{ [key: number]: string }>({});

  // Use RTK Query instead of manual fetch
  const { 
    data: levelAssignments = [], 
    isLoading, 
    error, 
    refetch: refetchLevelAssignments 
  } = useGetCiltMstrPositionLevelsByLevelIdQuery(levelId || 0, { 
    skip: !levelId,
    refetchOnMountOrArgChange: true 
  });

  useEffect(() => {
    fetchOplTypes();
  }, []);

  const fetchOplTypes = async () => {
    try {
      const response = await getOplTypes().unwrap();
      const typesMap = Array.isArray(response) 
        ? response.reduce((acc, type) => {
            if (type.documentType) {
              acc[type.id] = type.documentType;
            }
            return acc;
          }, {} as { [key: number]: string })
        : {};
      setOplTypesMap(typesMap);
    } catch (error) {
      console.error("Error fetching OPL types:", error);
      setOplTypesMap({});
    }
  };

  const getOplTypeName = (oplTypeId: number | null | undefined): string => {
    if (!oplTypeId || !oplTypesMap[oplTypeId]) {
      return Strings.oplFormNotAssigned;
    }
    return oplTypesMap[oplTypeId];
  };

  const showCiltDetails = (ciltMstr: CiltMstr & { sequences?: any[] }) => {
    setSelectedCiltMstr(ciltMstr);
    setCiltDetailsModalVisible(true);
  };

  const showSequenceList = (ciltMstr: CiltMstr & { sequences?: any[] }) => {
    setSelectedCiltMstr(ciltMstr);
    setSequenceListModalVisible(true);
  };
    
  // Show details of a specific sequence
  const showSequenceDetails = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setSingleSequenceModalVisible(true);
  };

  // Show view schedules modal
  const showViewSchedules = (sequence: CiltSequence) => {
    setSelectedSequenceForViewSchedules(sequence);
    setViewSchedulesVisible(true);
  };

  // Handle the close of view schedules modal
  const handleViewSchedulesCancel = () => {
    setViewSchedulesVisible(false);
    setSelectedSequenceForViewSchedules(null);
  };

  // Note: handleScheduleChange would be used if ViewSchedulesModal supported onScheduleChange prop
  // For now, we only refresh on new schedule creation

  const showScheduleSequence = (sequence: CiltSequence) => {
    setSelectedSequenceForSchedule(sequence);
    setScheduleSecuenceVisible(true);
  };

  const handleScheduleSequenceCancel = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequenceForSchedule(null);
  };

  const handleScheduleSequenceSuccess = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequenceForSchedule(null);
    
    // Force refresh of all schedule buttons
    setRefreshSchedules(prev => prev + 1);
    
    notification.success({
      message: Strings.success,
      description: Strings.successScheduleCreated,
    });
  };

  const handleDeleteAssignment = (assignment: CiltMstrPositionLevelWithRelations) => {
    Modal.confirm({
      title: Strings.ciltAssignmentDeleteConfirmTitle,
      content: Strings.ciltAssignmentDeleteFromCiltConfirmContent,
      okText: Strings.confirm,
      cancelText: Strings.cancel,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCiltAssignment(assignment.id).unwrap();
          // Show success notification using localized string
          notification.success({
            message: Strings.success,
            description: Strings.ciltAssignmentDeleteSuccess,
          });
          // Refresh the data by re-fetching
          refetchLevelAssignments();
        } catch (error: any) {
          // Log and show error notification using AnatomyNotification
          AnatomyNotification.error(notification, error, Strings.ciltAssignmentDeleteError);
        }
      },
    });
  };

  const handleDeletePositionAssignment = (assignment: CiltMstrPositionLevelWithRelations) => {
    Modal.confirm({
      title: Strings.ciltAssignmentDeleteConfirmTitle,
      content: Strings.ciltAssignmentDeleteFromPositionConfirmContent,
      okText: Strings.confirm,
      cancelText: Strings.cancel,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCiltAssignment(assignment.id).unwrap();
          // Show success notification using localized string
          notification.success({
            message: Strings.success,
            description: Strings.ciltAssignmentDeleteSuccess,
          });
          // Refresh the data by re-fetching
          refetchLevelAssignments();
        } catch (error: any) {
          // Log and show error notification using AnatomyNotification
          AnatomyNotification.error(notification, error, Strings.ciltAssignmentDeleteError);
        }
      },
    });
  };

  const handleDeleteOplAssignment = (opl: ExtendedOplLevel) => {
    Modal.confirm({
      title: 'Confirmar Eliminación',
      content: `¿Estás seguro de que deseas eliminar la asignación del OPL "${opl.title}"?`,
      okText: Strings.confirm,
      cancelText: Strings.cancel,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteOplLevel(opl.oplLevelId).unwrap();
          notification.success({
            message: Strings.success,
            description: 'Asignación de OPL eliminada correctamente.',
          });
          // Close the drawer to refresh the tree view
          onClose();
        } catch (error: any) {
          AnatomyNotification.error(notification, error, 'Error al eliminar la asignación de OPL');
        }
      },
    });
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
    if (isLoading || isDeleting) return <Spin size="large" />;
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
                <small style={{ color: 'gray' }}>{Strings.errorLoadingData}</small>
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
          {paginatedData.map((assignment: CiltMstrPositionLevelWithRelations) => (
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
                  <p><strong>{Strings.standardTime}:</strong> {assignment.ciltMstr?.standardTime ? `${Math.floor(assignment.ciltMstr.standardTime / 60)}:${(assignment.ciltMstr.standardTime % 60).toString().padStart(2, '0')} min` : '0:00 min'}</p>
                  <p><strong>{Strings.sequences}:</strong> {assignment.ciltMstr?.sequences?.length || 0}</p>
                  
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button 
                      type="primary" 
                      onClick={() => {
                        if (assignment.ciltMstr) {
                          showCiltDetails(assignment.ciltMstr);
                        }
                      }}
                    >
                      Ver detalles
                    </Button>
                    
                    {assignment.ciltMstr?.sequences && assignment.ciltMstr.sequences.length > 0 && (
                      <Button 
                        type="primary" 
                        onClick={() => {
                          if (assignment.ciltMstr) {
                            showSequenceList(assignment.ciltMstr);
                          }
                        }}
                      >
                        {Strings.viewSequences}
                      </Button>
                    )}
                    
                    <Button 
                      type="primary" 
                      danger
                      loading={isDeleting}
                      onClick={() => handleDeleteAssignment(assignment)}
                    >
                      {Strings.delete}
                    </Button>
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

  // State for positions search
  const [positionSearchText, setPositionSearchText] = useState('');
  const [positionPage, setPositionPage] = useState(1);
  const positionPageSize = 4;

  const renderPositions = () => {
    if (isLoading || isDeleting) return <Spin size="large" />;
    if (error) {
      console.error('Error rendering positions:', error);
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {Strings.errorLoadingData}
                <br />
                <small style={{ color: 'gray' }}>Error loading positions</small>
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

    // Filter positions based on search text
    const filteredPositions = positionSearchText.trim() 
      ? positionAssignments.filter(assignment => {
          const positionName = assignment.position?.name?.toLowerCase() || '';
          const positionDescription = assignment.position?.description?.toLowerCase() || '';
          const searchLower = positionSearchText.toLowerCase();
          return positionName.includes(searchLower) || positionDescription.includes(searchLower);
        })
      : positionAssignments;
    
    const paginatedData = getPaginatedItems(filteredPositions, positionPage, positionPageSize);
    
    if (filteredPositions.length === 0) {
      return <Empty description={Strings.noPositionsAssigned} />;
    }
    
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder={Strings.searchPosition}
            prefix={<SearchOutlined />}
            value={positionSearchText}
            onChange={(e) => {
              setPositionSearchText(e.target.value);
              setPositionPage(1); // Reset to first page on search
            }}
            style={{ width: '100%' }}
          />
        </div>

        <Row gutter={[16, 16]}>
          {paginatedData.map((assignment: CiltMstrPositionLevelWithRelations) => (
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
                
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Button 
                    type="default" 
                    size="small"
                    onClick={(e) => {
                      const button = e.currentTarget;
                      const usersList = button.parentElement?.nextElementSibling as HTMLElement;
                      if (usersList) {
                        const isVisible = usersList.style.display !== 'none';
                        usersList.style.display = isVisible ? 'none' : 'block';
                        button.classList.toggle('text-blue-500', !isVisible);
                      }
                    }}
                  >
                    {Strings.users || "Usuarios"}
                  </Button>
                  
                  <Button 
                    type="primary" 
                    size="small"
                    danger
                    loading={isDeleting}
                    onClick={() => handleDeletePositionAssignment(assignment)}
                  >
                    {Strings.delete}
                  </Button>
                </div>
                <div style={{ marginTop: '8px', display: 'none' }}>
                  <PositionUsers positionId={assignment.position?.id?.toString() || ""} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        
        {filteredPositions.length > positionPageSize && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Pagination
              current={positionPage}
              pageSize={positionPageSize}
              total={filteredPositions.length}
              onChange={setPositionPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    );
  };

  // State for OPL search and pagination
  const [oplSearchText, setOplSearchText] = useState('');
  const [oplPage, setOplPage] = useState(1);
  const oplPageSize = 4;
  const [selectedOpl, setSelectedOpl] = useState<ExtendedOplLevel | null>(null);
  const [oplDetailsModalVisible, setOplDetailsModalVisible] = useState(false);

  // Using RTK Query to fetch OPL assignments for the selected level
  const { data: oplAssignments, isLoading: isLoadingOpls, error: oplError } = 
    useGetOplLevelsByLevelIdQuery(levelId || 0, { skip: !levelId });

  // Filter OPL assignments based on search text
  const filteredOplAssignments = useMemo(() => {
    if (!oplAssignments) return [];
    
    // Cast the API response to ExtendedOplLevel array
    const typedOplAssignments = oplAssignments as unknown as ExtendedOplLevel[];
    
    if (!oplSearchText.trim()) {
      return typedOplAssignments;
    }
    
    const searchLower = oplSearchText.toLowerCase();
    return typedOplAssignments.filter(opl => {
      const title = opl.title?.toLowerCase() || '';
      const objective = opl.objetive?.toLowerCase() || '';
      
      return title.includes(searchLower) || objective.includes(searchLower);
    });
  }, [oplAssignments, oplSearchText]);

  // Get paginated OPL data
  const paginatedOplData = useMemo(() => {
    return getPaginatedItems(filteredOplAssignments, oplPage, oplPageSize);
  }, [filteredOplAssignments, oplPage, oplPageSize]);

  // Show OPL details
  const showOplDetails = (opl: any) => {
    setSelectedOpl(opl);
    setOplDetailsModalVisible(true);
  };

  // Get image URL helper function
  const getOplImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return url.startsWith('/') ? `https:${url}` : `https://${url}`;
  };

  // Render OPL details modal
  const renderOplDetailsModal = () => {
    if (!selectedOpl) return null;

    return (
      <Modal
        title={`${Strings.oplDetails}: ${selectedOpl.title || ""}`}
        open={oplDetailsModalVisible}
        onCancel={() => setOplDetailsModalVisible(false)}
        width={800}
        zIndex={1050} // Higher z-index to appear above other elements
        footer={[
          <Button key="close" onClick={() => setOplDetailsModalVisible(false)}>
            {Strings.close}
          </Button>
        ]}
      >
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <Card size="small" title={Strings.objective}>
              <Typography.Text>{selectedOpl.objetive || Strings.notSpecified}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title={Strings.creator}>
              <Typography.Text>{selectedOpl.creatorName || Strings.notSpecified}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title={Strings.reviewer}>
              <Typography.Text>{selectedOpl.reviewerName || Strings.notSpecified}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title="Created Date">
              <Typography.Text>{new Date(selectedOpl.createdAt).toLocaleDateString()}</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" title={Strings.type}>
              <Typography.Text>{getOplTypeName(selectedOpl.oplTypeId)}</Typography.Text>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: '24px' }}>
          <Typography.Title level={4}>{Strings.oplDetails}</Typography.Title>
          
          {selectedOpl.details && selectedOpl.details.length > 0 ? (
            <Row gutter={[16, 16]}>
              {selectedOpl.details.map((detail: any) => (
                <Col xs={24} md={12} key={detail.id}>
                  <Card 
                    size="small"
                    style={{ 
                      height: '100%',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e8e8e8',
                      borderRadius: '8px'
                    }}
                  >
                    {detail.text && (
                      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <Typography.Paragraph>{detail.text}</Typography.Paragraph>
                      </div>
                    )}
                    
                    {detail.mediaUrl && (
                      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                        {detail.type === 'imagen' ? (
                          <Image 
                            src={getOplImageUrl(detail.mediaUrl)}
                            alt={`Contenido ${detail.order}`}
                            style={{ 
                              width: '400px', 
                              height: '300px', 
                              objectFit: 'contain',
                              maxWidth: '100%' 
                            }}
                          />
                        ) : detail.type === 'video' ? (
                          <video 
                            controls 
                            src={detail.mediaUrl} 
                            style={{ 
                              width: '400px', 
                              maxWidth: '100%', 
                              height: '300px', 
                              objectFit: 'contain' 
                            }}
                          />
                        ) : (
                          <a href={detail.mediaUrl} target="_blank" rel="noopener noreferrer">
                            <Button type="primary" icon={<FileOutlined />}>{Strings.viewDocument}</Button>
                          </a>
                        )}
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description={Strings.oplNoDetails} />
          )}
        </div>
      </Modal>
    );
  };

  const renderOplSop = () => {
    if (isLoadingOpls) return <Spin size="large" />;
    
    if (oplError) {
      console.error('Error rendering OPL assignments:', oplError);
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {Strings.noOplSopAssigned}
              </span>
            }
          />
        </div>
      );
    }
    
    if (!oplAssignments || oplAssignments.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty description={Strings.noOplAssignmentsFound} />
        </div>
      );
    }
    
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder={Strings.searchOpls || "Search OPLs..."}
            prefix={<SearchOutlined />}
            value={oplSearchText}
            onChange={(e) => {
              setOplSearchText(e.target.value);
              setOplPage(1); // Reset to first page on search
            }}
            style={{ width: '100%' }}
          />
        </div>
        
        <Row gutter={[16, 16]}>
          {paginatedOplData.map((opl) => (
            <Col xs={24} sm={12} key={opl.id}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Badge status="processing" color="blue" />
                    <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                      {opl.title || 'Untitled OPL'}
                    </span>
                  </div>
                }
                style={{ height: '100%' }}
                actions={[
                  <Button type="primary" onClick={() => showOplDetails(opl)}>
                    {Strings.viewDetails}
                  </Button>,
                  <Button type="primary" danger loading={isDeletingOpl} onClick={() => handleDeleteOplAssignment(opl)}>
                    {Strings.delete}
                  </Button>
                ]}
              >
                <div style={{ minHeight: '100px' }}>
                  <p><strong>{Strings.type}:</strong> {getOplTypeName(opl.oplTypeId)}</p>
                  <p><strong>{Strings.objective}:</strong> {opl.objetive || Strings.notSpecified}</p>
                  <p><strong>{Strings.creator}:</strong> {opl.creatorName || Strings.notSpecified}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        
        {filteredOplAssignments.length > oplPageSize && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Pagination
              current={oplPage}
              total={filteredOplAssignments.length}
              pageSize={oplPageSize}
              onChange={(page) => setOplPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
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
    return selectedCiltMstr.sequences.filter((seq: any) => seq.status === 'A');
  }, [selectedCiltMstr]);
  
  // Filter sequences based on search text
  const filteredSequences = useMemo(() => {
    if (!sequenceSearchText.trim()) {
      return activeSequences;
    }
    
    const searchLower = sequenceSearchText.toLowerCase();
    return activeSequences.filter((sequence: any) => {
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
        title={<div style={{ whiteSpace: 'pre-wrap', paddingRight: '24px' }}>{`${Strings.sequences}: ${selectedCiltMstr.ciltName}`}</div>}
        open={sequenceListModalVisible}
        onCancel={() => setSequenceListModalVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
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
                  {paginatedData.map((sequence: CiltSequence) => (
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
                          <Text>{Math.floor(sequence.standardTime / 60)}:{(sequence.standardTime % 60).toString().padStart(2, '0')} min</Text>
                        </div>
                        <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Button 
                            type="default" 
                            icon={<CalendarOutlined />}
                            onClick={() => showScheduleSequence(sequence)}
                          >
                            {Strings.scheduleSequence}
                          </Button>
                          <ScheduleButton 
                            sequence={sequence} 
                            onViewSchedules={showViewSchedules} 
                            refreshKey={refreshSchedules}
                          />
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
    );
  };

  const renderSingleSequenceDetailsModal = () => {
    if (!selectedSequence) return null;

    return (
      <Modal
        title={<div style={{ whiteSpace: 'pre-wrap', paddingRight: '24px' }}>{Strings.sequenceDetails}</div>}
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
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  backgroundColor: `#${selectedSequence.secuenceColor || '000000'}`,
                  flexShrink: 0
                }} 
              />
              <span style={{ whiteSpace: 'pre-wrap' }}>{selectedSequence.secuenceList}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label={Strings.ciltTypeName}>
            {selectedSequence.ciltTypeName}
          </Descriptions.Item>
          <Descriptions.Item label={Strings.standardTime}>
            {Math.floor(selectedSequence.standardTime / 60)}:{(selectedSequence.standardTime % 60).toString().padStart(2, '0')} min
          </Descriptions.Item>
          <Descriptions.Item label={Strings.standardOk}>
            {selectedSequence.standardOk}
          </Descriptions.Item>
          {selectedSequence.toolsRequired && (
            <Descriptions.Item label={Strings.toolsRequired}>
              {selectedSequence.toolsRequired}
            </Descriptions.Item>
          )}
          {/* Special Warning field */}
          <Descriptions.Item label={Strings.specialWarning}>
            {selectedSequence.specialWarning || Strings.oplFormNotAssigned}
          </Descriptions.Item>
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
      {renderOplDetailsModal()}
      
      {/* Schedule Sequence Modal */}
      {selectedSequenceForSchedule && (
        <ScheduleSecuence
          open={scheduleSecuenceVisible}
          onCancel={handleScheduleSequenceCancel}
          onSave={handleScheduleSequenceSuccess}
          sequenceId={selectedSequenceForSchedule.id}
          ciltId={selectedSequenceForSchedule.ciltMstrId || undefined}
          siteId={selectedSequenceForSchedule.siteId || undefined}
        />
      )}

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

export default LevelDetailsDrawer;
