import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Select, Table, message, Row, Col, Space, Typography, Spin } from "antd";
import { useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useGetCardReportGroupedMutation, useGetChartsQuery, useGetChartsLevelsQuery } from "../../services/cardService";
import { navigateWithState } from "../../routes/RoutesExtensions";
import Constants from "../../utils/Constants";
import Strings from "../../utils/localizations/Strings";
import ChartExpander from "../charts/components/ChartExpander";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartDataLabels);

const { Title: AntTitle } = Typography;

interface Chart {
  id: number;
  siteId: number;
  chartName: string;
  chartDescription: string;
  rootNode: number;
  rootName: string;
  defaultPercentage: number | null;
  status: string;
  order: number | null;
}

interface ReportFilters {
  dateStart: string;
  dateEnd: string;
  siteId: number;
  rootNode: number;
  targetLevel: number;
  groupingLevel: number;
  statusFilter?: string;
}

const CardReportsPage: React.FC = () => {
  const location = useLocation();
  const navigate = navigateWithState();
  const [form] = Form.useForm();

  const [getCardReportGrouped, { isLoading: isLoadingReport }] = useGetCardReportGroupedMutation();

  // Load charts for the site (matching PHP lines 41-47)
  const { data: chartsData, isLoading: isLoadingCharts } = useGetChartsQuery(
    { siteId: location.state?.siteId },
    { skip: !location.state?.siteId }
  );

  // Ensure charts is always an array - handle both direct array and {data: array} response
  const charts: Chart[] = Array.isArray(chartsData)
    ? chartsData
    : (chartsData && Array.isArray((chartsData as any).data))
      ? (chartsData as any).data
      : [];

  const [chartType, setChartType] = useState<"pie" | "barV" | "barH" | "line">("pie");
  const [reportData, setReportData] = useState<any[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateStart: "2024-01-01",
    dateEnd: new Date().toISOString().split("T")[0],
    siteId: location.state?.siteId || 0,
    rootNode: 0,
    targetLevel: 4,
    groupingLevel: 2,
    statusFilter: "AR", // Default: Both A (Active) and R (Resolved) - matching PHP demo line 23
  });

  // Load charts_levels for selected chart (matching PHP lines 85-105)
  const { data: chartsLevelsData, isLoading: isLoadingLevels } = useGetChartsLevelsQuery(
    { chartId: selectedChartId! },
    { skip: !selectedChartId }
  );

  // Ensure chartsLevels is always an array - handle both direct array and {data: array} response
  const chartsLevels = Array.isArray(chartsLevelsData)
    ? chartsLevelsData
    : (chartsLevelsData && Array.isArray((chartsLevelsData as any).data))
      ? (chartsLevelsData as any).data
      : [];

  // Separate grouping and target levels
  const groupingLevels = Array.isArray(chartsLevels) ? chartsLevels.filter(l => l.levelType === 'grouping') : [];
  const targetLevels = Array.isArray(chartsLevels) ? chartsLevels.filter(l => l.levelType === 'target') : [];

  // Get selected chart data
  const selectedChart = charts.find(c => c.id === selectedChartId);

  // Initialize: Select first chart when charts load (matching PHP lines 58-59)
  useEffect(() => {
    if (charts.length > 0 && !selectedChartId) {
      const firstChart = charts[0];
      setSelectedChartId(firstChart.id);
      form.setFieldsValue({ chartId: firstChart.id });
    }
  }, [charts, selectedChartId]);

  // When chart changes, update rootNode and initialize levels (matching PHP lines 76-105)
  useEffect(() => {
    if (selectedChart) {
      const newFilters = {
        ...filters,
        rootNode: selectedChart.rootNode,
      };

      // Set default grouping_level and target_level when levels load
      if (groupingLevels.length > 0 && targetLevels.length > 0) {
        newFilters.groupingLevel = groupingLevels[0].level;
        newFilters.targetLevel = targetLevels[0].level;
      }

      setFilters(newFilters);
      form.setFieldsValue({
        groupingLevel: newFilters.groupingLevel,
        targetLevel: newFilters.targetLevel,
      });
    }
  }, [selectedChart, chartsLevels]);

  const handleSubmit = async (values: any) => {
    try {
      // rootNode comes from the selected chart, not from form values
      const params = {
        siteId: location.state?.siteId,
        rootNode: filters.rootNode, // Get from filters state (set when chart is selected)
        targetLevel: values.targetLevel,
        groupingLevel: values.groupingLevel,
        dateStart: values.dateStart,
        dateEnd: values.dateEnd,
        statusFilter: values.statusFilter || "AR",
      };

      if (!params.rootNode) {
        message.error('Please select a chart first');
        return;
      }

      setFilters(params);
      const result = await getCardReportGrouped(params).unwrap();
      setReportData(result || []);
    } catch (error: any) {
      console.error("Error fetching report:", error);
      message.error(error?.data?.message || Strings.errorLoadingReport);
    }
  };

  const totalCards = reportData.reduce((sum, item) => sum + (item.total_cards || 0), 0);

  // Chart data
  const labels = reportData.map((r) => r.level_name);
  const values = reportData.map((r) => r.total_cards);
  const colors = labels.map((_, i) => `hsl(${(i * 50) % 360}, 70%, 60%)`);

  const pieChartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 15 },
      },
      title: {
        display: true,
        text: `${Strings.totalCards} - ${Strings.targetLevel} ${filters.targetLevel}`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = totalCards ? ((value / totalCards) * 100).toFixed(1) : 0;
            return `${context.label}: ${value.toLocaleString()} ${Strings.cards} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        formatter: (value: number, ctx: any) => {
          const label = ctx.chart.data.labels[ctx.dataIndex] || "";
          const percentage = totalCards ? ((value / totalCards) * 100).toFixed(1) : 0;
          return `${label}\n${value.toLocaleString()} (${percentage}%)`;
        },
        anchor: "center" as const,
        align: "center" as const,
        clamp: true,
        color: "#111",
        font: { weight: "bold" as const, size: 12 },
      },
    },
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: Strings.totalCards,
        data: values,
        backgroundColor: colors,
        borderColor: "#e9ecef",
        borderWidth: 1,
      },
    ],
  };

  const barVChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => Number(value).toLocaleString(),
        },
        title: { display: true, text: "Total de tarjetas" },
      },
      x: {
        ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: `${Strings.cards} - ${Strings.verticalBars}` },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            const percentage = totalCards ? ((value / totalCards) * 100).toFixed(1) : 0;
            return `${value.toLocaleString()} tarjetas (${percentage}%)`;
          },
        },
      },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        formatter: (value: number) => {
          const percentage = totalCards ? ((value / totalCards) * 100).toFixed(1) : 0;
          return `${value.toLocaleString()} (${percentage}%)`;
        },
        color: "#111",
        font: { weight: "bold" as const, size: 11 },
        clip: true,
      },
    },
  };

  const barHChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => Number(value).toLocaleString(),
        },
        title: { display: true, text: "Total de tarjetas" },
      },
      y: { ticks: { autoSkip: false } },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: `${Strings.cards} - ${Strings.horizontalBars}` },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            const percentage = totalCards ? ((value / totalCards) * 100).toFixed(1) : 0;
            return `${value.toLocaleString()} tarjetas (${percentage}%)`;
          },
        },
      },
      datalabels: {
        anchor: "end" as const,
        align: "right" as const,
        formatter: (value: number) => {
          const percentage = totalCards ? ((value / totalCards) * 100).toFixed(1) : 0;
          return `${value.toLocaleString()} (${percentage}%)`;
        },
        color: "#111",
        font: { weight: "bold" as const, size: 11 },
        clip: true,
      },
    },
  };

  // Line chart configuration - matching PHP demo lines 564-582
  const lineChartData = {
    labels,
    datasets: [
      {
        label: Strings.totalCards,
        data: values,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#0d6efd',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => Number(value).toLocaleString(),
        },
        title: { display: true, text: "Total de tarjetas" },
      },
      x: {
        ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: `${Strings.cards} - Líneas` },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            const percentage = totalCards ? ((value / totalCards) * 100).toFixed(1) : 0;
            return `${value.toLocaleString()} tarjetas (${percentage}%)`;
          },
        },
      },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        formatter: (value: number) => (value > 0 ? value.toLocaleString() : ''),
        color: "#111",
        font: { weight: "bold" as const, size: 11 },
        clip: true,
      },
    },
    elements: {
      line: { fill: false },
    },
  };

  const columns = [
    {
      title: `${Strings.level} ${filters.groupingLevel}`,
      dataIndex: "level_name",
      key: "level_name",
    },
    {
      title: Strings.totalCards,
      dataIndex: "total_cards",
      key: "total_cards",
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: Strings.viewReport,
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            navigate(`/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cardReportDetail}`, {
              rootId: record.grouping_id,
              targetLevel: filters.targetLevel,
              groupingLevel: filters.groupingLevel,
              dateStart: filters.dateStart,
              dateEnd: filters.dateEnd,
              siteId: filters.siteId,
              levelName: record.level_name,
            });
          }}
        >
          {Strings.viewReport}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <AntTitle level={3}>{Strings.cardReportsTitle}</AntTitle>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={filters}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            {/* Chart select - matching PHP line 305 */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item label={Strings.chart || "Chart"} name="chartId" rules={[{ required: true }]}>
                <Select
                  loading={isLoadingCharts}
                  placeholder={Strings.selectChart || "Select chart"}
                  onChange={(value) => setSelectedChartId(value)}
                  notFoundContent={isLoadingCharts ? <Spin size="small" /> : null}
                  options={charts.map((c) => ({
                    label: `${c.rootNode} - ${c.rootName}`, // Display: root_node + root_name (PHP line 53)
                    value: c.id,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label={Strings.startDate} name="dateStart" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label={Strings.endDate} name="dateEnd" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>

            {/* Grouping Level select - matching PHP line 321 */}
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label={Strings.groupingLevel} name="groupingLevel" rules={[{ required: true }]}>
                <Select
                  loading={isLoadingLevels}
                  disabled={!selectedChartId}
                  placeholder={Strings.selectLevel || "Select level"}
                  notFoundContent={isLoadingLevels ? <Spin size="small" /> : null}
                  options={groupingLevels.map((l) => ({
                    label: `${l.level} - ${l.levelName}`, // Show level number + name (PHP line 322)
                    value: l.level,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* Target Level select - matching PHP line 327 */}
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label={Strings.targetLevel} name="targetLevel" rules={[{ required: true }]}>
                <Select
                  loading={isLoadingLevels}
                  disabled={!selectedChartId}
                  placeholder={Strings.selectLevel || "Select level"}
                  notFoundContent={isLoadingLevels ? <Spin size="small" /> : null}
                  options={targetLevels.map((l) => ({
                    label: `${l.level} - ${l.levelName}`,
                    value: l.level,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* Status Filter - matching PHP line 333 */}
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label={Strings.statusFilter || "Status Filter"} name="statusFilter">
                <Select
                  placeholder={Strings.selectStatus || "Select status"}
                  options={[
                    { value: "AR", label: `${Strings.statusOpen || "Active"} + ${Strings.statusResolved || "Resolved"}` },
                    { value: "A", label: Strings.statusOpen || "Active (A)" },
                    { value: "R", label: Strings.statusResolved || "Resolved (R)" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={6} lg={4}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" loading={isLoadingReport} block>
                  {Strings.generateReport}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Chart type toggle buttons + Ampliar button - matching PHP demo lines 357-364 */}
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space wrap>
            <Button type={chartType === "pie" ? "primary" : "default"} onClick={() => setChartType("pie")}>
              {Strings.pieChart}
            </Button>
            <Button type={chartType === "barV" ? "primary" : "default"} onClick={() => setChartType("barV")}>
              {Strings.verticalBars}
            </Button>
            <Button type={chartType === "barH" ? "primary" : "default"} onClick={() => setChartType("barH")}>
              {Strings.horizontalBars}
            </Button>
            <Button type={chartType === "line" ? "primary" : "default"} onClick={() => setChartType("line")}>
              Líneas
            </Button>
          </Space>
        </Space>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card
              title={Strings.charts}
              size="small"
              extra={reportData.length > 0 && (
                <ChartExpander title={`${Strings.charts} - ${selectedChart?.chartName || ''}`}>
                  <div style={{ height: '100%', position: "relative" }}>
                    {chartType === "pie" ? (
                      <Pie data={pieChartData} options={pieChartOptions} />
                    ) : chartType === "barV" ? (
                      <Bar data={barChartData} options={barVChartOptions} />
                    ) : chartType === "barH" ? (
                      <Bar data={barChartData} options={barHChartOptions} />
                    ) : (
                      <Line data={lineChartData} options={lineChartOptions} />
                    )}
                  </div>
                </ChartExpander>
              )}
            >
              <div style={{ height: 400, position: "relative" }}>
                {reportData.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 20px", color: "#6c757d" }}>
                    {Strings.noData}
                  </div>
                ) : chartType === "pie" ? (
                  <Pie data={pieChartData} options={pieChartOptions} />
                ) : chartType === "barV" ? (
                  <Bar data={barChartData} options={barVChartOptions} />
                ) : chartType === "barH" ? (
                  <Bar data={barChartData} options={barHChartOptions} />
                ) : (
                  <Line data={lineChartData} options={lineChartOptions} />
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={Strings.details} size="small">
              {reportData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
                  {Strings.noData}
                </div>
              ) : (
                <>
                  <Table
                    columns={columns}
                    dataSource={reportData}
                    pagination={false}
                    rowKey="grouping_id"
                    size="small"
                    scroll={{ x: true }}
                  />
                  <div style={{ marginTop: 10, fontWeight: "bold", color: "#0d6efd" }}>
                    {Strings.total}: {totalCards.toLocaleString()}
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CardReportsPage;
