import React, { useState, useEffect } from "react";
import { Table, Input, Spin, Typography, Button, Tag } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { Resizable } from 'react-resizable';
import { useGetCiltSequenceExecutionsBySiteMutation } from "../../services/cilt/ciltSequencesExecutionsService";
import MainContainer from "../layouts/MainContainer";
import { CiltSequenceExecution } from "../../data/cilt/ciltSequencesExecutions/ciltSequencesExecutions";
import type { ColumnsType } from "antd/es/table";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { UnauthorizedRoute } from "../../utils/Routes";
import { format } from "date-fns";
import ExecutionDetailsModal from "./components/ExecutionDetailsModal";
import 'react-resizable/css/styles.css';

const { Text } = Typography;

// Custom styles for better resize experience
const resizableStyles = `
  .ant-table-thead > tr > th {
    position: relative;
  }
  
  .ant-table-thead > tr > th:hover .react-resizable-handle {
    background: #1890ff;
    opacity: 0.3;
  }
  
  .react-resizable-handle {
    transition: all 0.2s ease;
  }
  
  .react-resizable-handle:hover {
    background: #1890ff !important;
    opacity: 0.5 !important;
  }
  
  .ant-table-thead > tr > th.ant-table-column-has-sorters:hover {
    background: #fafafa;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = resizableStyles;
  if (!document.head.querySelector('[data-resizable-table-styles]')) {
    styleElement.setAttribute('data-resizable-table-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

// Resizable column header component
const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props;
  const [isResizing, setIsResizing] = useState(false);

  if (!width) {
    return <th {...restProps} />;
  }

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          style={{
            position: 'absolute',
            right: '-3px',
            bottom: 0,
            top: 0,
            width: '6px',
            background: 'transparent',
            cursor: 'col-resize',
            zIndex: 2,
            borderRadius: '3px',
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={handleResizeStart}
          onMouseUp={handleResizeStop}
        />
      }
      onResize={onResize}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th 
        {...restProps} 
        style={{ 
          ...restProps.style, 
          position: 'relative',
          borderRight: isResizing ? '2px solid #1890ff' : '1px solid #f0f0f0',
          userSelect: isResizing ? 'none' : 'auto',
        }} 
      />
    </Resizable>
  );
};

export const CILTReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState<CiltSequenceExecution[]>([]);
  const [filteredExecutions, setFilteredExecutions] = useState<
    CiltSequenceExecution[]
  >([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExecution, setSelectedExecution] =
    useState<CiltSequenceExecution | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
  });

  // State for column widths
  const [columnWidths, setColumnWidths] = useState({
    siteExecutionId: 60,
    route: 80,
    secuenceColor: 60,
    secuenceSchedule: 140,
    duration: 80,
    standardOk: 200,
    status: 80,
    actions: 120,
  });

  const [getCiltSequenceExecutionsBySite] =
    useGetCiltSequenceExecutionsBySiteMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state?.siteId || Strings.empty;

  // Load executions when component mounts
  useEffect(() => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    loadExecutions();
  }, [location.state]);

  // Load executions
  const loadExecutions = async () => {
    if (!siteId) return;

    setLoading(true);
    try {
      const executionsData = await getCiltSequenceExecutionsBySite(
        siteId
      ).unwrap();
      console.log("executionsData", executionsData);
      setExecutions(executionsData);
      setFilteredExecutions(executionsData);
    } catch (error) {
      console.error("Error loading executions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter executions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredExecutions(executions);
      setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page when clearing search
    } else {
      const filtered = executions.filter(
        (execution) =>
          // Filter by any searchable field including IDs
          String(execution.id).includes(searchTerm) ||
          String(execution.siteExecutionId).includes(searchTerm) ||
          String(execution.ciltId).includes(searchTerm) ||
          (execution.route?.toLowerCase().includes(searchTerm.toLowerCase()) ??
            false) ||
          (execution.secuenceList
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false) ||
          (execution.ciltTypeName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false) ||
          (execution.standardOk
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false) ||
          (execution.secuenceStart
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false) ||
          (execution.secuenceStop
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false)
      );
      setFilteredExecutions(filtered);
      setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page when searching
    }
  }, [executions, searchTerm]);

  // Handle refresh
  const handleRefresh = () => {
    loadExecutions();
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return Strings.oplFormNotAssigned;
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      return Strings.oplFormNotAssigned;
    }
  };

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined)
      return Strings.oplFormNotAssigned;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const showDetailsModal = (execution: CiltSequenceExecution) => {
    setSelectedExecution(execution);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedExecution(null);
  };

  // Handle column resize
  const handleResize = (columnKey: string) => (_: any, { size }: any) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: size.width,
    }));
  };

  const columns: ColumnsType<CiltSequenceExecution> = [
    {
      title: "ID",
      dataIndex: "siteExecutionId",
      key: "siteExecutionId",
      render: (text) => text || Strings.oplFormNotAssigned,
      width: columnWidths.siteExecutionId,
      align: "center",
      sorter: (a, b) => {
        const aId = a.siteExecutionId || 0;
        const bId = b.siteExecutionId || 0;
        return aId - bId;
      },
      onHeaderCell: () => ({
        width: columnWidths.siteExecutionId,
        onResize: handleResize('siteExecutionId'),
      }),
    },
    {
      title: Strings.route,
      dataIndex: "route",
      key: "route",
      render: (text) => text || Strings.oplFormNotAssigned,
      width: columnWidths.route,
      ellipsis: { showTitle: true },
      sorter: (a, b) => (a.route || "").localeCompare(b.route || ""),
      filterSearch: true,
      onHeaderCell: () => ({
        width: columnWidths.route,
        onResize: handleResize('route'),
      }),
    },
    {
      title: Strings.color,
      dataIndex: "secuenceColor",
      key: "secuenceColor",
      render: (color) => (
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
      width: columnWidths.secuenceColor,
      align: "center",
      onHeaderCell: () => ({
        width: columnWidths.secuenceColor,
        onResize: handleResize('secuenceColor'),
      }),
    },
    {
      title: Strings.schedule,
      dataIndex: "secuenceSchedule",
      key: "secuenceSchedule",
      render: (text) => formatDate(text),
      width: columnWidths.secuenceSchedule,
      sorter: (a, b) => {
        if (!a.secuenceSchedule && !b.secuenceSchedule) return 0;
        if (!a.secuenceSchedule) return -1;
        if (!b.secuenceSchedule) return 1;
        return new Date(a.secuenceSchedule).getTime() - new Date(b.secuenceSchedule).getTime();
      },
      onHeaderCell: () => ({
        width: columnWidths.secuenceSchedule,
        onResize: handleResize('secuenceSchedule'),
      }),
    },
    {
      title: Strings.duration,
      dataIndex: "duration",
      key: "duration",
      render: (duration) => formatDuration(duration),
      width: columnWidths.duration,
      align: "center",
      sorter: (a, b) => {
        if (a.duration === null && b.duration === null) return 0;
        if (a.duration === null) return -1;
        if (b.duration === null) return 1;
        return a.duration - b.duration;
      },
      onHeaderCell: () => ({
        width: columnWidths.duration,
        onResize: handleResize('duration'),
      }),
    },
    {
      title: Strings.standardOk,
      dataIndex: "standardOk",
      key: "standardOk",
      render: (text) => text || Strings.oplFormNotAssigned,
      width: columnWidths.standardOk,
      ellipsis: { showTitle: true },
      filterSearch: true,
      onHeaderCell: () => ({
        width: columnWidths.standardOk,
        onResize: handleResize('standardOk'),
      }),
    },
    {
      title: Strings.status,
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (!status) return Strings.oplFormNotAssigned;
        return status === "A" ? (
          <Tag color="green">{Strings.active}</Tag>
        ) : (
          <Tag color="blue">{Strings.resolved}</Tag>
        );
      },
      width: columnWidths.status,
      align: "center",
      filters: [
        { text: Strings.active, value: "A" },
        { text: Strings.resolved, value: "R" },
      ],
      onFilter: (value, record) => record.status === value as string,
      onHeaderCell: () => ({
        width: columnWidths.status,
        onResize: handleResize('status'),
      }),
    },
    {
      title: Strings.actions,
      key: "actions",
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => showDetailsModal(record)}
        >
          {Strings.ciltCardListViewDetailsButton || "Ver Detalles"}
        </Button>
      ),
      width: columnWidths.actions,
      onHeaderCell: () => ({
        width: columnWidths.actions,
        onResize: handleResize('actions'),
      }),
    },
  ];

  return (
    <MainContainer
      title={Strings.ciltReportsSB}
      description=""
      content={
        <div>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <Text strong>{siteName}</Text>
              </div>
              <div>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                >
                  {Strings.refresh}
                </Button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <Input
                placeholder="Search by ID, route, sequence, type, standard OK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 400 }}
              />
              <Text style={{ marginLeft: "auto" }}>
                {Strings.total}: {filteredExecutions.length}{" "}
                {Strings.executions}
              </Text>
            </div>
          </div>

          <Spin spinning={loading}>
            <Table
              dataSource={filteredExecutions}
              columns={columns}
              rowKey={(record) => String(record.id)}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredExecutions.length,
                showSizeChanger: true,
                pageSizeOptions: ["20", "50", "100", "200"],
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} ${Strings.of} ${total} ${Strings.items}`,
              }}
              onChange={(paginationConfig) => {
                setPagination({
                  current: paginationConfig.current || 1,
                  pageSize: paginationConfig.pageSize || 100,
                });
              }}
              bordered
              size="middle"
              scroll={{ x: 800 }}
              components={{
                header: {
                  cell: ResizableTitle,
                },
              }}
            />
          </Spin>
          <ExecutionDetailsModal
            isVisible={isModalVisible}
            execution={selectedExecution}
            onClose={handleModalClose}
          />
        </div>
      }
    />
  );
};
