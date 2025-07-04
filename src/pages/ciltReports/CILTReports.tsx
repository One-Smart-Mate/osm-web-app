import { useState, useEffect } from "react";
import { Table, Input, Spin, Typography, Button, Tag } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGetCiltSequenceExecutionsBySiteMutation } from "../../services/cilt/ciltSequencesExecutionsService";
import MainContainer from "../layouts/MainContainer";
import { CiltSequenceExecution } from "../../data/cilt/ciltSequencesExecutions/ciltSequencesExecutions";
import type { ColumnsType } from "antd/es/table";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { UnauthorizedRoute } from "../../utils/Routes";
import { format } from "date-fns";
import ExecutionDetailsModal from "./components/ExecutionDetailsModal";

const { Text } = Typography;

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
    } else {
      const filtered = executions.filter(
        (execution) =>
          // Filter by any searchable field
          String(execution.id).includes(searchTerm) ||
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

  const columns: ColumnsType<CiltSequenceExecution> = [
    {
      title: Strings.route,
      dataIndex: "route",
      key: "route",
      render: (text) => text || Strings.oplFormNotAssigned,
      width: 80,
      ellipsis: { showTitle: true },
      sorter: (a, b) => (a.route || "").localeCompare(b.route || ""),
      filterSearch: true,
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
      width: 60,
      align: "center",
    },
    {
      title: Strings.schedule,
      dataIndex: "secuenceSchedule",
      key: "secuenceSchedule",
      render: (text) => formatDate(text),
      width: 140,
      sorter: (a, b) => {
        if (!a.secuenceSchedule && !b.secuenceSchedule) return 0;
        if (!a.secuenceSchedule) return -1;
        if (!b.secuenceSchedule) return 1;
        return new Date(a.secuenceSchedule).getTime() - new Date(b.secuenceSchedule).getTime();
      },
    },
    {
      title: Strings.duration,
      dataIndex: "duration",
      key: "duration",
      render: (duration) => formatDuration(duration),
      width: 80,
      align: "center",
      sorter: (a, b) => {
        if (a.duration === null && b.duration === null) return 0;
        if (a.duration === null) return -1;
        if (b.duration === null) return 1;
        return a.duration - b.duration;
      },
    },
    {
      title: Strings.standardOk,
      dataIndex: "standardOk",
      key: "standardOk",
      render: (text) => text || Strings.oplFormNotAssigned,
      width: 200,
      ellipsis: { showTitle: true },
      filterSearch: true,
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
          <Tag color="red">{Strings.inactive}</Tag>
        );
      },
      width: 80,
      align: "center",
      filters: [
        { text: Strings.active, value: "A" },
        { text: Strings.inactive, value: "I" },
      ],
      onFilter: (value, record) => record.status === value as string,
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
      width: 120,
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
                placeholder={Strings.searchBarDefaultPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 300 }}
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
                pageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              bordered
              size="middle"
              scroll={{ x: 800 }}
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
