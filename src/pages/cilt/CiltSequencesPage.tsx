import React, { useState, useEffect, useRef, useCallback } from "react";
import { createContext, useContext } from "react";
import {
  DndProvider,
  useDrag,
  useDrop,
  ConnectDragSource,
  DropTargetMonitor,
} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Button,
  Space,
  Spin,
  Typography,
  notification,
  Input,
  Table,
  Modal,
} from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import MainContainer from "../layouts/MainContainer";
import AnatomyNotification from "../components/AnatomyNotification";
import { CiltMstr } from "../../data/cilt/ciltMstr/ciltMstr";
import { CiltSequence } from "../../data/cilt/ciltSequences/ciltSequences";
import { OplMstr } from "../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../data/cilt/oplDetails/oplDetails";
import { useGetCiltMstrByIdMutation } from "../../services/cilt/ciltMstrService";
import {
  useGetCiltSequencesByCiltMutation,
  useUpdateCiltSequenceOrderMutation,
  useDeleteCiltSequenceMutation,
} from "../../services/cilt/ciltSequencesService";
import { useGetOplMstrByIdMutation } from "../../services/cilt/oplMstrService";
import { useGetOplDetailsByOplMutation } from "../../services/cilt/oplDetailsService";
import CreateCiltSequenceModal from "./components/CreateCiltSequenceModal";
import SequenceDetailsModal from "./components/SequenceDetailsModal";
import EditCiltSequenceModal from "./components/EditCiltSequenceModal";
import OplDetailsModal from "./components/OplDetailsModal";
import ScheduleSecuence from "./components/ScheduleSecuence";
import Constants from "../../utils/Constants";
import { formatSecondsToNaturalTime } from "../../utils/timeUtils";
import type { ColumnsType } from "antd/es/table";
// import Strings from "../../utils/localizations/Strings"; // Using direct Spanish strings as per user request
import { MdDragHandle } from "react-icons/md";
import Strings from "../../utils/localizations/Strings";

const { Text } = Typography;

const DragHandleContext = createContext<{ drag: ConnectDragSource }>({
  drag: () => null,
});

const DragHandle = () => {
  const { drag } = useContext(DragHandleContext);
  return (
    <span
      ref={drag as any}
      style={{
        cursor: "move",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
        borderRadius: "4px",
      }}
      className="drag-handle"
      onMouseDown={(e) => e.stopPropagation()}
      title="Arrastrar para reordenar"
    >
      <MdDragHandle style={{ fontSize: "18px" }} />
    </span>
  );
};

const DRAG_TYPE = "CILT_SEQUENCE_ROW";

export interface DragItem {
  index: number;
  originalIndex: number;
  recordId: number;
  type: string;
}

interface DraggableBodyRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index?: number;
  record: CiltSequence;
  moveRow: (_dragIndex: number, _hoverIndex: number) => void;
  onDropRow: (_draggedItem: DragItem) => void;
}

const DraggableBodyRow: React.FC<DraggableBodyRowProps> = ({
  index,
  record,
  moveRow,
  onDropRow,
  className,
  style,
  ...restProps
}) => {
  // Use the drag handle context
  useContext(DragHandleContext);
  const ref = useRef<HTMLTableRowElement>(null);
  const safeIndex = typeof index === "number" ? index : -1;

  const [{ isDragging, handlerId }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => {
      return {
        type: DRAG_TYPE,
        index: safeIndex,
        originalIndex: safeIndex,
        recordId: record?.id || -1,
      };
    },
    canDrag: record && safeIndex !== -1,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  });

  const [{ isOver }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean }
  >({
    accept: DRAG_TYPE,
    collect: (monitor: DropTargetMonitor<DragItem, void>) => ({
      isOver: monitor.isOver(),
    }),
    canDrop: () => safeIndex !== -1,
    hover: (item: DragItem, monitor: DropTargetMonitor<DragItem, void>) => {
      if (!ref.current || safeIndex === -1 || item.index === -1) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = safeIndex;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Get rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Get the middle Y position
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Simple threshold - more predictable behavior
      // Dragging downwards - must move past the middle for the next row
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards - must move above the middle for the previous row
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop: (item: DragItem) => {
      onDropRow(item);
    },
  });

  drop(ref);

  // Only render if we have a valid record
  if (!record) {
    return null;
  }

  return (
    <DragHandleContext.Provider value={{ drag }}>
      <tr
        ref={ref}
        className={`${className || ""} ${isOver ? " ant-table-row-hover" : ""} ${isDragging ? " dragging-row" : ""}`}
        style={{
          ...style,
          opacity: isDragging ? 0.4 : 1,
          cursor: isDragging ? "grabbing" : "default"
        }}
        data-handler-id={handlerId}
        data-row-key={record.id}
        {...restProps}
      >
        {restProps.children}
      </tr>
    </DragHandleContext.Provider>
  );
};

const CiltSequencesPage = () => {
  const { ciltId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentCilt, setCurrentCilt] = useState<CiltMstr | null>(null);
  const [sequences, setSequences] = useState<CiltSequence[]>([]);
  const [filteredSequences, setFilteredSequences] = useState<CiltSequence[]>(
    []
  );
  const sequencesRef = useRef(filteredSequences);
  useEffect(() => {
    sequencesRef.current = filteredSequences;
  }, [filteredSequences]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCreateSequenceModalVisible, setIsCreateSequenceModalVisible] =
    useState(false);
  const [isSequenceDetailModalVisible, setIsSequenceDetailModalVisible] =
    useState(false);
  const [isEditSequenceModalVisible, setIsEditSequenceModalVisible] =
    useState(false);
  const [isOplDetailsModalVisible, setIsOplDetailsModalVisible] =
    useState(false);
  const [isScheduleSecuenceVisible, setScheduleSecuenceVisible] =
    useState(false);

  const [selectedSequence, setSelectedSequence] = useState<CiltSequence | null>(
    null
  );
  const [selectedOpl, setSelectedOpl] = useState<OplMstr | null>(null);
  const [selectedOplDetails, setSelectedOplDetails] = useState<OplDetail[]>([]);
  const [loadingOplDetails, setLoadingOplDetails] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [getCiltById] = useGetCiltMstrByIdMutation();
  const [getCiltSequencesByCilt] = useGetCiltSequencesByCiltMutation();
  const [getOplMstrById] = useGetOplMstrByIdMutation();
  const [getOplDetailsByOpl] = useGetOplDetailsByOplMutation();
  const [updateCiltSequenceOrder, { isLoading: isUpdatingOrder }] =
    useUpdateCiltSequenceOrderMutation();
  const [deleteCiltSequence, { isLoading: isDeleting }] = useDeleteCiltSequenceMutation();

  useEffect(() => {
    if (!ciltId) return;

    const loadCiltAndSequences = async () => {
      setLoading(true);
      try {
        const ciltData = await getCiltById(ciltId).unwrap();
        setCurrentCilt(ciltData);

        const sequencesData = await getCiltSequencesByCilt(ciltId).unwrap();
        const sortedSequencesFromServer = [...sequencesData].sort((a, b) => {
          return (a.order || 0) - (b.order || 0);
        });

        setSequences(sortedSequencesFromServer);
        // Initial filtering logic based on active status and searchTerm
        // This will also be covered by the filtering useEffect, but good for initial load.
        const activeSequences = sortedSequencesFromServer.filter(
          (seq) => seq.status === Constants.STATUS_ACTIVE
        );
        if (!searchTerm.trim()) {
          setFilteredSequences(activeSequences);
        } else {
          const furtherFiltered = activeSequences.filter(
            (sequence) =>
              sequence.secuenceList
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              sequence.order?.toString().includes(searchTerm) ||
              sequence.standardTime?.toString().includes(searchTerm) ||
              sequence.toolsRequired
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
          setFilteredSequences(furtherFiltered);
        }

        if (sequencesData.length === 0) {
          notification.info({
            message: "Información",
            description: `Este CILT "${ciltData.ciltName}" no tiene secuencias asociadas.`,
            className: "ant-notification-notice-info",
            icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
          });
        }
      } catch (error) {
        console.error("Error al cargar CILT o secuencias:", error);
        AnatomyNotification.error(notification, {
          data: {
            message: "Error al cargar CILT o secuencias",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadCiltAndSequences();
  }, [ciltId, getCiltById, getCiltSequencesByCilt, refreshTrigger]);

  useEffect(() => {
    // Ensure sequences are sorted by order before filtering
    const sortedSequences = [...sequences].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    const activeOnlySequences = sortedSequences.filter(
      (sequence) => sequence.status === Constants.STATUS_ACTIVE
    );

    if (!searchTerm.trim()) {
      setFilteredSequences(activeOnlySequences);
    } else {
      const furtherFiltered = activeOnlySequences.filter(
        (sequence) =>
          sequence.secuenceList
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sequence.order?.toString().includes(searchTerm) ||
          sequence.standardTime?.toString().includes(searchTerm) ||
          sequence.toolsRequired
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredSequences(furtherFiltered);
    }
  }, [sequences, searchTerm, refreshTrigger]); // Added refreshTrigger to re-filter after DND and data refresh

  const showCreateSequenceModal = () => {
    if (!currentCilt) return;
    setIsCreateSequenceModalVisible(true);
  };

  const handleCreateSequenceCancel = () => {
    setIsCreateSequenceModalVisible(false);
  };

  const handleCreateSequenceSuccess = () => {
    setIsCreateSequenceModalVisible(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const showSequenceDetails = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setIsSequenceDetailModalVisible(true);
  };

  const handleSequenceDetailModalCancel = () => {
    setIsSequenceDetailModalVisible(false);
    setSelectedSequence(null);
  };

  const showEditSequenceModal = (sequence: CiltSequence) => {
    setSelectedSequence(sequence);
    setIsEditSequenceModalVisible(true);
  };

  const handleEditSequenceModalCancel = () => {
    setIsEditSequenceModalVisible(false);
    setSelectedSequence(null);
  };

  const handleEditSequenceSuccess = () => {
    setIsEditSequenceModalVisible(false);
    setSelectedSequence(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const showOplDetails = async (oplId: number | null) => {
    if (!oplId) {
      AnatomyNotification.error(
        notification,
        {
          data: {
            message: "No hay OPL asociado a esta secuencia.",
          },
        },
        "Information"
      );
      return;
    }

    setLoadingOplDetails(true);

    try {
      const opl = await getOplMstrById(oplId.toString()).unwrap();
      setSelectedOpl(opl);

      const details = await getOplDetailsByOpl(oplId.toString()).unwrap();
      setSelectedOplDetails(details);

      setIsOplDetailsModalVisible(true);

      if (details.filter((detail) => detail.type !== "texto").length === 0) {
        AnatomyNotification.error(
          notification,
          {
            data: {
              message: `El OPL "${opl.title}" no tiene archivos multimedia.`,
            },
          },
          "Información"
        );
      }
    } catch (error) {
      console.error("Error al cargar detalles de OPL:", error);
    } finally {
      setLoadingOplDetails(false);
    }
  };

  const handleOplDetailsModalCancel = () => {
    setIsOplDetailsModalVisible(false);
    setSelectedOpl(null);
    setSelectedOplDetails([]);
  };

  const handleScheduleSequenceCancel = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequence(null);
  };

  const handleScheduleSequenceSuccess = () => {
    setScheduleSecuenceVisible(false);
    setSelectedSequence(null);
  };

  const goBack = () => {
    // Navegar hacia atrás preservando la información del sitio en el estado
    navigate(-1);
  };

  const handleDeleteSequence = (sequence: CiltSequence) => {
    Modal.confirm({
      title: Strings.ciltSequenceDeleteConfirmTitle,
      content: Strings.ciltSequenceDeleteConfirmContent,
      okText: Strings.confirm,
      cancelText: Strings.cancel,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCiltSequence(sequence.id.toString()).unwrap();
          // Show success notification using localized string
          notification.success({
            message: Strings.success,
            description: Strings.ciltSequenceDeleteSuccess,
          });
          // Refresh sequences data
          setRefreshTrigger((prev) => prev + 1);
        } catch (error: any) {
          // Log and show error notification using AnatomyNotification
          AnatomyNotification.error(notification, error, Strings.ciltSequenceDeleteError);
        }
      },
    });
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      // Safety check for valid indices
      if (dragIndex < 0 || hoverIndex < 0 || 
          dragIndex >= sequencesRef.current.length || 
          hoverIndex >= sequencesRef.current.length) {
        console.error('Invalid indices for moveRow', { dragIndex, hoverIndex, length: sequencesRef.current.length });
        return;
      }
      
      // Create a new array to maintain immutability
      const newSequences = [...sequencesRef.current];
      
      // Move the item
      const [draggedItem] = newSequences.splice(dragIndex, 1);
      newSequences.splice(hoverIndex, 0, draggedItem);
      
      // Update both state and ref
      setFilteredSequences(newSequences);
      sequencesRef.current = newSequences;
    },
    []
  );

  const handleReorderOnDrop = useCallback(
    async (draggedItem: DragItem) => {
      // If item wasn't moved, do nothing
      if (draggedItem.originalIndex === draggedItem.index) return;
      if (draggedItem.recordId < 0) return;

      try {
        // Use the ref to get the most up-to-date sequences
        const currentSequences = [...sequencesRef.current];
        
        // Double check that we have sequences
        if (!currentSequences || currentSequences.length === 0) {
          console.error("No sequences available", { draggedItem });
          setRefreshTrigger(prev => prev + 1);
          return;
        }

        const finalIndex = draggedItem.index;
        
        // Safety checks for index bounds
        if (finalIndex < 0 || finalIndex >= currentSequences.length) {
          console.error("Invalid drop index", { finalIndex, length: currentSequences.length });
          setRefreshTrigger(prev => prev + 1);
          return;
        }
        
        // For safety, try to find using final position first, then fall back to ID matching
        let draggedSequence: CiltSequence | undefined = currentSequences[finalIndex];
        
        // If not found by position or if IDs don't match, try to find by ID
        if (!draggedSequence || draggedSequence.id !== draggedItem.recordId) {
          const foundSequence = currentSequences.find(seq => seq.id === draggedItem.recordId);
          if (foundSequence) {
            draggedSequence = foundSequence;
          }
        }
        
        // Check if we have valid sequences
        if (!draggedSequence) {
          notification.error({ message: "Error al reordenar", description: "No se pudo encontrar la secuencia arrastrada." });
          setRefreshTrigger(prev => prev + 1);
          return;
        }

        // Get adjacent sequences to calculate new order
        const sequenceBefore = finalIndex > 0 ? currentSequences[finalIndex - 1] : null;
        const sequenceAfter = finalIndex < currentSequences.length - 1 ? currentSequences[finalIndex + 1] : null;

        // Get the order values of adjacent sequences
        const orderBefore = sequenceBefore ? sequenceBefore.order : null;
        const orderAfter = sequenceAfter ? sequenceAfter.order : null;

        // Calculate new order based on adjacent sequences
        let newOrder: number;
        if (orderBefore !== null && orderAfter !== null) {
          // If between two sequences, take the average
          newOrder = orderBefore + (orderAfter - orderBefore) / 2;
        } else if (orderBefore !== null) {
          // If at the end of the list
          newOrder = orderBefore + 1;
        } else if (orderAfter !== null) {
          // If at the beginning of the list
          newOrder = orderAfter > 1 ? orderAfter - 1 : 1;
        } else {
          // Only one item
          newOrder = 1;
        }

        // Ensure we're only sending integers since the backend doesn't handle decimals well
        newOrder = Math.floor(newOrder);

        // Ensure we're sending valid data to the API
        if (!draggedSequence.id || isNaN(newOrder)) {
          throw new Error("Invalid data for sequence update");
        }
        
        // Simple visual feedback  
        const reorderedRow = document.querySelector(
          `tr[data-row-key="${draggedSequence.id}"]`
        );
        if (reorderedRow) {
          reorderedRow.classList.add("reordered-row");
          setTimeout(() => {
            reorderedRow.classList.remove("reordered-row");
          }, 1500);
        }
        
        const updatedSequence = { ...draggedSequence, order: newOrder };
        
        const updatedSequences = currentSequences.map(seq => 
          seq.id === updatedSequence.id ? updatedSequence : seq
        ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        
        
        setSequences(updatedSequences);
        setFilteredSequences(updatedSequences);
        sequencesRef.current = updatedSequences;
        
        // Send the update to the backend sin esperar a que termine
        updateCiltSequenceOrder({ 
          sequenceId: draggedSequence.id, 
          newOrder: Math.max(1, newOrder) 
        }).then(() => {
          console.log("Reorder successful");
        }).catch(error => {
          console.error("Error updating order in backend:", error);
          AnatomyNotification.error(notification, {
            data: {
              message: Strings.errorUpdatingSequenceOrder,
            },
          });
          setRefreshTrigger(prev => prev + 1);
        });
      } catch (error) {
        console.error(Strings.errorUpdatingSequenceOrder, error);
        AnatomyNotification.error(notification, {
          data: {
            message:
              Strings.errorUpdatingSequenceOrder,
          },
        });
        setRefreshTrigger((p) => p + 1);
      }
    },
    [updateCiltSequenceOrder, notification, setRefreshTrigger]
  );
  
  const columns: ColumnsType<CiltSequence> = [
    {
      title: "",
      dataIndex: "order",
      key: "order",
      align: "center" as const,
      width: 50,
      render: () => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DragHandle />
        </div>
      ),
    },
    {
      title: Strings.color,
      dataIndex: "secuenceColor",
      key: "secuenceColor",
      render: (color: string | null) => (
        <div
          style={{
            backgroundColor:
              color && color.startsWith("#") ? color : `#${color || "f0f0f0"}`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid #d9d9d9",
            margin: "auto",
          }}
        />
      ),
      width: 20,
    },
    {
      title: Strings.standardTime,
      dataIndex: "standardTime",
      key: "standardTime",
      render: (time) => formatSecondsToNaturalTime(time) || "N/A",
      width: 60,
    },
    {
      title: Strings.ciltType,
      dataIndex: "ciltTypeName",
      key: "ciltTypeName",
      render: (text) => text || "N/A",
      width: 60,
    },
    {
      title: Strings.actions,
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            onClick={() => showSequenceDetails(record)}
          >
            {Strings.viewDetails}
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => showEditSequenceModal(record)}
          >
            {Strings.edit}
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() =>
              record.referenceOplSopId &&
              showOplDetails(record.referenceOplSopId)
            }
            disabled={
              !record.referenceOplSopId || record.referenceOplSopId <= 0
            }
          >
            {Strings.viewReferenceOplButton}
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => showOplDetails(record.remediationOplSopId)}
            disabled={!record.remediationOplSopId}
          >
            {Strings.viewRemediationOplButton}
          </Button>
          <Button
            type="primary"
            size="small"
            danger
            loading={isDeleting}
            onClick={() => handleDeleteSequence(record)}
          >
            {Strings.delete}
          </Button>
        </Space>
      ),
      width: 320,
    },
  ];

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <style>
          {`
          /* Simpler styles for better compatibility with Ant Design */
          tr.ant-table-row td:first-child {
            cursor: move;
          }
          
          .dragging-row td {
            background-color: #f5f5f5 !important;
          }
          
          .drag-handle {
            background-color: #f0f0f0;
            border-radius: 4px;
            margin-right: 4px;
          }
          
          .drag-handle:hover {
            background-color: #e6f7ff;
          }
          
          /* Simple highlight animation */
          @keyframes highlight {
            0% { background-color: #ffffff; }
            50% { background-color: #bae7ff; }
            100% { background-color: #ffffff; }
          }
          
          .reordered-row td {
            animation: highlight 1.5s ease;
          }
        `}
        </style>
        <MainContainer
          title={
            currentCilt ? `Secuencias de ${currentCilt.ciltName}` : "Secuencias"
          }
          description=""
          content={
            <div>
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
                  {"Volver"} {/* Direct Spanish string */}
                </Button>

                <Input
                  placeholder={"Buscar secuencias..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                  style={{ width: 300 }}
                />

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateSequenceModal}
                  disabled={Boolean(!currentCilt)}
                >
                  {"Crear Secuencia"}
                </Button>

                <Text style={{ marginLeft: "auto" }}>
                  {"Total"}: {filteredSequences.length} {"Secuencias"}{" "}
                  {/* Direct Spanish string */}
                </Text>
              </div>

              <Spin spinning={loading || isUpdatingOrder || isDeleting}>
                <Table
                  dataSource={filteredSequences}
                  columns={columns} // Use the restored columns constant
                  rowKey={(record) => String(record.id)}
                  pagination={{
                    pageSize: 100,
                    showSizeChanger: true,
                    pageSizeOptions: ["20", "50", "100", "200"],
                  }}
                  bordered
                  size="middle"
                  scroll={{ x: 1300 }} // Increased width to accommodate new 'Order' column
                  components={{
                    body: {
                      row: DraggableBodyRow,
                    },
                  }}
                  onRow={(record: CiltSequence, index?: number) =>
                    ({
                      index,
                      record,
                      moveRow: moveRow,
                      onDropRow: handleReorderOnDrop,
                    } as any)
                  }
                />
              </Spin>
            </div>
          }
        />
        {currentCilt && (
          <CreateCiltSequenceModal
            visible={isCreateSequenceModalVisible}
            cilt={currentCilt}
            onCancel={handleCreateSequenceCancel}
            onSuccess={handleCreateSequenceSuccess}
            siteId={location.state?.siteId}
          />
        )}

        <SequenceDetailsModal
          visible={isSequenceDetailModalVisible}
          sequence={selectedSequence}
          onCancel={handleSequenceDetailModalCancel}
          onViewOpl={showOplDetails}
        />

        <EditCiltSequenceModal
          open={isEditSequenceModalVisible}
          sequence={selectedSequence}
          onCancel={handleEditSequenceModalCancel}
          onSuccess={handleEditSequenceSuccess}
        />

        <OplDetailsModal
          visible={isOplDetailsModalVisible}
          opl={selectedOpl}
          details={selectedOplDetails}
          loading={loadingOplDetails}
          onCancel={handleOplDetailsModalCancel}
        />

        <ScheduleSecuence
          open={isScheduleSecuenceVisible}
          onCancel={handleScheduleSequenceCancel}
          onSave={handleScheduleSequenceSuccess}
        />
      </DndProvider>
    </>
  );
};

export default CiltSequencesPage;