import { useState, useEffect, useRef, useCallback } from "react";
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
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
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
        transition: "all 0.2s ease",
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

interface DragItem {
  id: number;
  originalIndex: number;
  index: number;
  record: CiltSequence;
}

interface DraggableBodyRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  index?: number;
  record: CiltSequence;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  onDropRow: (draggedItem: DragItem) => void;
}

const DraggableBodyRow: React.FC<DraggableBodyRowProps> = ({
  record,
  index,
  moveRow,
  onDropRow,
  className,
  style,
  ...restProps
}) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const safeIndex = typeof index === "number" ? index : -1;

  const [{ handlerId, isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: (): DragItem => ({
      id: record.id,
      originalIndex: safeIndex,
      index: safeIndex,
      record,
    }),
    canDrag: safeIndex !== -1,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  });

  const [{ isOver, dropCanDrop }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean; dropCanDrop: boolean }
  >({
    accept: DRAG_TYPE,
    collect: (monitor: DropTargetMonitor<DragItem, void>) => ({
      isOver: monitor.isOver(),
      dropCanDrop: monitor.canDrop(),
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

      // Get rectangle height instead of middle Y (since we use percentage thresholds)

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // For more precision and responsiveness, adjust the threshold based on distance
      const longDistanceMove = Math.abs(dragIndex - hoverIndex) > 5;
      const threshold = longDistanceMove ? 0.1 : 0.5; // More sensitive for long-distance moves

      // Only perform the move when the mouse has crossed threshold percentage of the item's height
      // When dragging downwards, only move when the cursor is below threshold% of the item's height
      // When dragging upwards, only move when the cursor is above threshold% of the item's height

      // Dragging downwards
      if (
        dragIndex < hoverIndex &&
        hoverClientY < hoverBoundingRect.height * threshold
      ) {
        return;
      }

      // Dragging upwards
      if (
        dragIndex > hoverIndex &&
        hoverClientY > hoverBoundingRect.height * (1 - threshold)
      ) {
        return;
      }

      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    drop: (item: DragItem) => {
      onDropRow(item);
    },
  });

  drop(ref);

  return (
    <DragHandleContext.Provider value={{ drag }}>
      <tr
        ref={ref}
        className={`${className || ""}${
          isOver && dropCanDrop ? " hover-over" : ""
        }${isDragging ? " dragging-row" : ""}`}
        style={{
          ...style,
          opacity: isDragging ? 0.5 : 1,
        }}
        data-handler-id={handlerId}
        {...restProps}
      />
    </DragHandleContext.Provider>
  );
};

const CiltSequencesPage = () => {
  const { ciltId } = useParams();
  const navigate = useNavigate();

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
    navigate(-1);
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newSequences = [...filteredSequences];
      const [draggedItem] = newSequences.splice(dragIndex, 1);
      newSequences.splice(hoverIndex, 0, draggedItem);
      setFilteredSequences(newSequences);
    },
    [filteredSequences]
  );

  const handleReorderOnDrop = useCallback(
    async (draggedItem: DragItem) => {
      if (draggedItem.originalIndex === draggedItem.index) return;

      const currentSequences = sequencesRef.current;
      const finalIndex = draggedItem.index;
      const draggedSequence = currentSequences[finalIndex];

      // Defensive check for state consistency
      if (!draggedSequence || draggedSequence.id !== draggedItem.record.id) {
        AnatomyNotification.error(notification, {
          data: { message: "Error de consistencia. Se restaurará el orden." },
        });
        setRefreshTrigger((p) => p + 1);
        return;
      }

      const itemBefore =
        finalIndex > 0 ? currentSequences[finalIndex - 1] : null;
      const itemAfter =
        finalIndex < currentSequences.length - 1
          ? currentSequences[finalIndex + 1]
          : null;

      // Ensure we have valid numeric orders
      const orderBefore =
        typeof itemBefore?.order === "number" ? itemBefore.order : null;
      const orderAfter =
        typeof itemAfter?.order === "number" ? itemAfter.order : null;

      let newOrder: number;

      // Check for NaN prevention at each calculation point
      if (orderBefore !== null && orderAfter !== null) {
        // Case 1: Dropped between two items.
        if (orderAfter - orderBefore > 1) {
          // Integer gap exists - calculate midpoint, ensuring it's at least 1
          newOrder = Math.max(
            1,
            Math.floor(orderBefore + (orderAfter - orderBefore) / 2)
          );
        } else {
          // No integer gap - just use the next order position
          // Use the orderAfter value directly since the backend will swap them
          newOrder = orderAfter;

          // Backend logic handles this by swapping the existing item with this order
          // with our current item, so we don't need to calculate a new unique value
        }
      } else if (orderBefore !== null) {
        // Case 2: Dropped at the end of the list.
        newOrder = orderBefore + 1;
      } else if (orderAfter !== null) {
        // Case 3: Dropped at the beginning of the list.
        if (orderAfter > 1) {
          // If there's room before the first item
          newOrder = Math.max(1, orderAfter - 1);
        } else {
          // If the first item is already at 1, use its value
          // The backend will handle the swap
          newOrder = 1;
        }
      } else {
        // Case 4: The list was empty or has only one item.
        newOrder = 1;
      }

      // Final validation to ensure we never send invalid values to the backend
      if (isNaN(newOrder) || newOrder < 1) {
        console.error("Calculated order is invalid, using fallback value");
        newOrder = 1000; // Safe fallback that meets the @Min(1) constraint
      }

      // Ensure we're only sending integers since the backend doesn't handle decimals well
      newOrder = Math.floor(newOrder);

      try {
        // Log the values we're sending to help with debugging
        console.log("Sending reorder request:", {
          sequenceId: draggedSequence.id,
          newOrder: newOrder,
          isNaN: isNaN(newOrder),
        });

        // Apply visual feedback before the server call
        const reorderedRow = document.querySelector(
          `tr[data-row-key="${draggedSequence.id}"]`
        );
        if (reorderedRow) {
          reorderedRow.classList.add("reordered-row");
          setTimeout(() => {
            reorderedRow.classList.remove("reordered-row");
          }, 1500);
        }

        await updateCiltSequenceOrder({
          sequenceId: draggedSequence.id,
          newOrder: newOrder,
        }).unwrap();

        console.log("Reorder successful");
        setRefreshTrigger((p) => p + 1);
      } catch (error) {
        console.error("Error al reordenar secuencias:", error);
        AnatomyNotification.error(notification, {
          data: {
            message:
              "Error al reordenar las secuencias. Se restaurará el orden anterior.",
          },
        });
        setRefreshTrigger((p) => p + 1);
      }
    },
    [updateCiltSequenceOrder, notification, setRefreshTrigger]
  );
  const columns: ColumnsType<CiltSequence> = [
    {
      title: "Orden",
      dataIndex: "order",
      key: "order",
      align: "center" as const,
      width: 50,
      render: () => <DragHandle />,
    },
    {
      title: "Color",
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
      title: "Tiempo Estándar",
      dataIndex: "standardTime",
      key: "standardTime",
      render: (time) => formatSecondsToNaturalTime(time) || "N/A",
      width: 60,
    },
    {
      title: "Frecuencia",
      dataIndex: "frecuencyCode",
      key: "frecuencyCode",
      render: (text) => text || "N/A",
      width: 30,
    },
    {
      title: "Tipo CILT",
      dataIndex: "ciltTypeName",
      key: "ciltTypeName",
      render: (text) => text || "N/A",
      width: 60,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            onClick={() => showSequenceDetails(record)}
          >
            {"Ver Detalles"}
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => showEditSequenceModal(record)}
          >
            {"Editar"}
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
            {"Ver OPL Ref."}
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => showOplDetails(record.remediationOplSopId)}
            disabled={!record.remediationOplSopId}
          >
            {"Ver OPL Rem."}
          </Button>
        </Space>
      ),
      width: 250,
    },
  ];

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <style>
          {`
          .hover-over > td {
            background-color: #e6f7ff !important;
            transition: all 0.3s ease;
            border-left: 3px solid #1890ff !important;
          }
          .ant-table-row.drop-target > td {
            border-top: 2px dashed #1890ff;
          }
          .drop-over-downward > td {
            border-bottom: 2px dashed #1890ff;
          }
          .drop-over-upward > td {
            border-top: 2px dashed #1890ff;
          }
          tr.ant-table-row:hover {
            cursor: default;
          }
          tr.ant-table-row td:first-child {
            cursor: move;
          }
          .dragging-row td {
            background-color: #f0f8ff !important;
            opacity: 0.7;
          }
          /* Animation for row reordering */
          @keyframes highlight {
            0% { background-color: #ffffff; }
            50% { background-color: #e6f7ff; }
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

              <Spin spinning={loading || isUpdatingOrder}>
                <Table
                  dataSource={filteredSequences}
                  columns={columns} // Use the restored columns constant
                  rowKey={(record) => String(record.id)}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
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