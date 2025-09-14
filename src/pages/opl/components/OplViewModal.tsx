import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from "react";
import { Modal, Typography, Descriptions, Space, Divider, Card, Image, Button, Empty } from "antd";
import { FileTextOutlined, PictureOutlined, VideoCameraOutlined, FilePdfOutlined, FileOutlined } from "@ant-design/icons";
import { MdDragHandle } from "react-icons/md";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { OplMstr } from "../../../data/cilt/oplMstr/oplMstr";
import { OplDetail } from "../../../data/cilt/oplDetails/oplDetails";
import Strings from "../../../utils/localizations/Strings";

const { Title, Text, Paragraph } = Typography;

// Create context for drag handle functionality
const DragHandleContext = createContext<{ drag: any }>({ drag: () => null });

// Drag handle component for reordering items
const DragHandle = () => {
  const { drag } = useContext(DragHandleContext);
  return (
    <div
      ref={drag}
      style={{
        cursor: "grab",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        borderRadius: "4px",
        transition: "all 0.2s ease, background-color 0.2s ease, transform 0.2s ease",
        marginRight: "8px",
        backgroundColor: "#e6f7ff", 
        border: "1px solid #91d5ff",
        transform: "scale(1)",
        boxShadow: "0 2px 4px rgba(24, 144, 255, 0.3)",
      }}
      className="drag-handle"
      onMouseDown={(e) => {
        e.stopPropagation();
        // Change cursor to grabbing when dragging
        const target = e.currentTarget as HTMLDivElement;
        target.style.cursor = "grabbing";
      }}
      onMouseUp={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.cursor = "grab";
      }}
      title={Strings.dragToReorder}
    >
      <MdDragHandle style={{ fontSize: "22px", color: "#1890ff" }} />
    </div>
  );
};

// Define drag type for react-dnd
const DRAG_TYPE = "OPL_DETAIL_CARD";

// Interface for draggable item
interface DragItem {
  id: number;
  originalIndex: number;
  index: number;
  detail: OplDetail;
}

interface DraggableCardProps {
  detail: OplDetail;
  index: number;
  moveCard: (_dragIndex: number, _hoverIndex: number) => void;
  onDropCard: (_item: DragItem) => void;
  children: React.ReactNode;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  detail,
  index,
  moveCard,
  onDropCard,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId, isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: (): DragItem => ({
      id: detail.id,
      originalIndex: index,
      index: index,
      detail,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DRAG_TYPE,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Get rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      item.index = hoverIndex;
    },
    drop: (item: DragItem) => {
      onDropCard(item);
    },
  });

  drag(drop(ref));
  
  return (
    <DragHandleContext.Provider value={{ drag }}>
      <div 
        ref={ref}
        className={`draggable-card ${isOver && canDrop ? "hover-over" : ""} ${isDragging ? "dragging" : ""}`}
        style={{
          opacity: isDragging ? 0.6 : 1,
          transition: "opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
          transform: isOver ? "scale(1.01)" : isDragging ? "scale(0.99)" : "scale(1)",
          marginBottom: "16px",
          cursor: isDragging ? "grabbing" : "default",
          boxShadow: isOver ? "0 4px 12px rgba(0, 120, 255, 0.25)" : isDragging ? "0 2px 8px rgba(24, 144, 255, 0.4)" : "none",
          borderRadius: "8px",
          position: "relative",
          zIndex: isDragging ? 1000 : 1
        }}
        data-handler-id={handlerId}
      >
        {children}
      </div>
    </DragHandleContext.Provider>
  );
};

interface OplViewModalProps {
  open: boolean;
  currentOpl: OplMstr | null;
  currentDetails: OplDetail[];
  onCancel: () => void;
  onUpdateDetailOrder?: (_detailId: number, _newOrder: number) => void;
}

const OplViewModal: React.FC<OplViewModalProps> = ({
  open,
  currentOpl,
  currentDetails,
  onCancel,
  onUpdateDetailOrder,
}) => {
  // State for PDF preview modal
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  
  // State for video preview modal
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [currentVideoUrl] = useState("");
  
  // State for ordered details
  const [sortedDetails, setSortedDetails] = useState<OplDetail[]>([]);
  
  // Sort details by order when they change
  useEffect(() => {
    if (currentDetails?.length) {
      // Create a sorted copy of the details
      const sorted = [...currentDetails].sort((a, b) => {
        return (a.order || 0) - (b.order || 0);
      });
      setSortedDetails(sorted);
    } else {
      setSortedDetails([]);
    }
  }, [currentDetails]);
  
  // Function to handle moving cards during drag
  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      // Create a copy of the sorted details
      const newDetails = [...sortedDetails];
      // Remove the dragged item
      const [draggedItem] = newDetails.splice(dragIndex, 1);
      // Insert it at the new position
      newDetails.splice(hoverIndex, 0, draggedItem);
      // Update the state
      setSortedDetails(newDetails);
    },
    [sortedDetails]
  );
  
  // Function to handle card drop (when ordering is complete)
  const handleCardDrop = useCallback(
    async (draggedItem: DragItem) => {
      // Return if item hasn't moved or if onUpdateDetailOrder callback is not provided
      if (draggedItem.originalIndex === draggedItem.index || !onUpdateDetailOrder) return;
      
      const finalIndex = draggedItem.index;
      const draggedDetail = sortedDetails[finalIndex];
      
      // Ensure consistency
      if (!draggedDetail || draggedDetail.id !== draggedItem.detail.id) {
        console.error("Error de consistencia. Se restaurará el orden.");
        // Reset to the original order
        setSortedDetails([...currentDetails].sort((a, b) => (a.order || 0) - (b.order || 0)));
        return;
      }
      
      // Get adjacent items to calculate new order
      const itemBefore = finalIndex > 0 ? sortedDetails[finalIndex - 1] : null;
      const itemAfter = finalIndex < sortedDetails.length - 1 ? sortedDetails[finalIndex + 1] : null;
      
      // Ensure we have valid orders
      const orderBefore = typeof itemBefore?.order === "number" ? itemBefore.order : null;
      const orderAfter = typeof itemAfter?.order === "number" ? itemAfter.order : null;
      
      let newOrder: number;
      
      // Calculate new order based on position
      if (orderBefore !== null && orderAfter !== null) {
        // Between two items
        if (orderAfter - orderBefore > 1) {
          // Gap exists, use midpoint
          newOrder = Math.floor(orderBefore + (orderAfter - orderBefore) / 2);
        } else {
          // No gap, use one of the existing orders and let backend handle swapping
          newOrder = orderAfter;
        }
      } else if (orderBefore !== null) {
        // At the end of the list
        newOrder = orderBefore + 1;
      } else if (orderAfter !== null) {
        // At the beginning of the list
        newOrder = orderAfter > 1 ? orderAfter - 1 : 1;
      } else {
        // Only one item or empty list
        newOrder = 1;
      }
      
      // Ensure newOrder is valid
      if (isNaN(newOrder) || newOrder < 1) {
        newOrder = 1000; // Safe fallback
      }
      
      // Round to ensure integer
      newOrder = Math.floor(newOrder);
      
      try {
        // Apply the order change via the callback
        onUpdateDetailOrder(draggedDetail.id, newOrder);
      } catch (error) {
        console.error("Error al reordenar detalles:", error);
        // Reset to original order on error
        setSortedDetails([...currentDetails].sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    },
    [sortedDetails, onUpdateDetailOrder, currentDetails]
  );


  // Helper function to extract filename from URL
  const getFileName = (url: string | undefined): string => {
    if (!url) return "";
    
    try {
      // Decode URL components
      const decodedUrl = decodeURIComponent(url);
      
      // Extract filename from URL
      const parts = decodedUrl.split('/');
      let fullName = parts[parts.length - 1];
      
      // Remove query parameters if any
      fullName = fullName.split('?')[0];
      
      // Remove any additional parameters after underscore
      if (fullName.includes('_')) {
        const nameParts = fullName.split('_');
        // If it's a UUID pattern after underscore, remove it
        if (nameParts.length > 1 && nameParts[1].match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)) {
          fullName = nameParts[0];
        }
      }
      
      // If the filename still has a path pattern like "images/opl/filename.ext", extract just the filename
      if (fullName.includes('/')) {
        const pathParts = fullName.split('/');
        fullName = pathParts[pathParts.length - 1];
      }
      
      // If filename still has encoded characters like %20, try to decode again
      if (fullName.includes('%')) {
        try {
          fullName = decodeURIComponent(fullName);
        } catch (_e) {
          // If decoding fails, keep the current name
        }
      }
      
      return fullName;
    } catch (_e) {
      // If any error occurs during processing, try a simpler approach
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('?')[0];
      
      // Return just the last part of the path
      return fileName;
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Render an individual detail
  const renderDetailContent = (detail: OplDetail) => {
    if (detail.type === "texto") {
      return (
        <Card
          style={{
            margin: 0,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
          title={<Space><DragHandle /><FileTextOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplTextType}</Text></Space>}
          bordered={true}
        >
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{detail.text}</Paragraph>
        </Card>
      );
    } else if (detail.type === "imagen" && detail.mediaUrl) {
      return (
        <Card
          style={{
            margin: 0,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
          title={<Space><DragHandle /><PictureOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplImageType}</Text></Space>}
          bordered={true}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image 
              src={detail.mediaUrl} 
              alt="Image" 
              style={{ 
                width: '100%', 
                height: '180px', 
                objectFit: 'contain',
                maxWidth: '350px' 
              }} 
              fallback="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
            />
          </div>
          <Text style={{ marginTop: 8, display: 'block', fontWeight: 'bold', textAlign: 'center' }}>{getFileName(detail.mediaUrl)}</Text>
        </Card>
      );
    } else if (detail.type === "video" && detail.mediaUrl) {
      return (
        <Card
          style={{
            margin: 0,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
          title={<Space><DragHandle /><VideoCameraOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplVideoType}</Text></Space>}
          bordered={true}
        >
          <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <video 
              src={detail.mediaUrl} 
              controls 
              style={{ 
                width: '100%', 
                maxWidth: '350px', 
                height: '180px', 
                objectFit: 'contain' 
              }}
            />
            <Text style={{ marginTop: 8, display: 'block', fontWeight: 'bold', textAlign: 'center' }}>{getFileName(detail.mediaUrl)}</Text>
          </div>
        </Card>
      );
    } else if (detail.type === "pdf" && detail.mediaUrl) {
      return (
        <Card
          style={{
            margin: 0,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
          title={<Space><DragHandle /><FilePdfOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> <Text strong>{Strings.oplPdfType}</Text></Space>}
          bordered={true}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              onClick={() => {
                setCurrentPdfUrl(detail.mediaUrl || "");
                setPdfPreviewVisible(true);
              }}
              icon={<FileOutlined />}
            >
              {Strings.oplViewPdf}
            </Button>
            <Text style={{ display: 'block', fontWeight: 'bold' }}>{getFileName(detail.mediaUrl)}</Text>
          </Space>
        </Card>
      );
    }
    return null;
  };

  return (
    <>
      <Modal
        title={<Title level={4}>{Strings.oplViewModalTitle}</Title>}
        open={open}
        onCancel={onCancel}
        width={1100}
        style={{ top: 20 }}
        bodyStyle={{ padding: '0', height: '80vh', display: 'flex', flexDirection: 'column' }}
        className="opl-view-modal"
        destroyOnClose
        footer={[
          <Button key="close" onClick={onCancel}>
            {Strings.oplClose}
          </Button>
        ]}
      >
        <div style={{
          height: '100%',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Descriptions bordered column={1} style={{ marginBottom: '16px' }}>
            <Descriptions.Item label={Strings.oplTitle}>
              {currentOpl?.title || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.oplObjective}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{currentOpl?.objetive || '-'}</div>
            </Descriptions.Item>
            <Descriptions.Item label={Strings.oplCreatedBy}>
              {currentOpl?.creatorName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.oplReviewedBy}>
              {currentOpl?.reviewerName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.oplCreationDate}>
              {formatDate(currentOpl?.createdAt)}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">{Strings.oplContentPreview}</Divider>

          {sortedDetails && sortedDetails.length > 0 && (
            <div style={{
              padding: '10px',
              marginBottom: '16px',
              backgroundColor: '#e6f7ff',
              borderRadius: '4px',
              border: '1px dashed #1890ff',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(24, 144, 255, 0.15)',
              flexShrink: 0
            }}>
              <MdDragHandle style={{ fontSize: "22px", color: "#1890ff", marginRight: "10px" }} />
              <div>
                <Text strong style={{ display: 'block', color: '#1890ff' }}>{Strings.dragToReorder}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>Drag the items to arrange their order</Text>
              </div>
            </div>
          )}

          {sortedDetails && sortedDetails.length > 0 ? (
            <div style={{ flex: 1 }}>
              <DndProvider backend={HTML5Backend}>
                <div className="opl-details-container" style={{ padding: '0' }}>
                  {sortedDetails.map((detail, index) => (
                    <DraggableCard
                      key={detail.id}
                      detail={detail}
                      index={index}
                      moveCard={moveCard}
                      onDropCard={handleCardDrop}
                    >
                      {renderDetailContent(detail)}
                    </DraggableCard>
                  ))}
                </div>
              </DndProvider>
            </div>
          ) : (
            <Empty description={Strings.oplNoDetails} />
          )}
        </div>
      </Modal>
      
      {/* PDF Preview Modal */}
      <Modal
        title={Strings.oplPdfPreviewTitle}
        open={pdfPreviewVisible}
        onCancel={() => setPdfPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPdfPreviewVisible(false)}>
            {Strings.oplClose}
          </Button>,
          <Button 
            key="open" 
            type="primary" 
            onClick={() => window.open(currentPdfUrl)}
          >
            {Strings.oplOpenInNewTab}
          </Button>
        ]}
      >
        <embed 
          src={currentPdfUrl} 
          style={{ width: '100%', height: '600px', border: 'none' }} 
          type="application/pdf"
        />
      </Modal>
      
      {/* Video Preview Modal */}
      <Modal
        title={Strings.oplVideoPreviewTitle}
        open={videoPreviewVisible}
        onCancel={() => setVideoPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setVideoPreviewVisible(false)}>
            {Strings.oplClose}
          </Button>,
          <Button 
            key="open" 
            type="primary" 
            onClick={() => window.open(currentVideoUrl)}
          >
            {Strings.oplOpenInNewTab}
          </Button>
        ]}
      >
        <video 
          src={currentVideoUrl} 
          controls 
          style={{ width: '100%', maxHeight: '600px' }}
        />
      </Modal>
    </>
  );
};

export default OplViewModal;
