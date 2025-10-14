import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Select, Slider, Table, message, Row, Col, Space, Typography } from "antd";
import { useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useGetCardReportGroupedMutation } from "../../services/cardService";
import { useGetlevelsMutation } from "../../services/levelService";
import { navigateWithState } from "../../routes/RoutesExtensions";
import Constants from "../../utils/Constants";
import Strings from "../../utils/localizations/Strings";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const { Title: AntTitle } = Typography;

interface ReportFilters {
  dateStart: string;
  dateEnd: string;
  siteId: number;
  rootNode: number;
  targetLevel: number;
  groupingLevel: number;
}

const CardReportsPage: React.FC = () => {
  const location = useLocation();
  const navigate = navigateWithState();
  const [form] = Form.useForm();

  const [getCardReportGrouped, { isLoading: isLoadingReport }] = useGetCardReportGroupedMutation();
  const [getLevels] = useGetlevelsMutation();

  const [chartType, setChartType] = useState<"pie" | "barV" | "barH">("pie");
  const [reportData, setReportData] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    dateStart: "2024-01-01",
    dateEnd: new Date().toISOString().split("T")[0],
    siteId: location.state?.siteId || 0,
    rootNode: 0,
    targetLevel: 4,
    groupingLevel: 2,
  });

  useEffect(() => {
    if (location.state?.siteId) {
      loadLevels();
    }
  }, [location.state?.siteId]);

  const loadLevels = async () => {
    try {
      const result = await getLevels(location.state?.siteId.toString()).unwrap();
      setLevels(result || []);

      // Set first root level as default
      const rootLevels = result.filter((l: any) => l.level === 0 || l.superiorId === 0);
      if (rootLevels.length > 0) {
        const rootId = Number(rootLevels[0].id);
        setFilters(prev => ({ ...prev, rootNode: rootId }));
        form.setFieldsValue({ rootNode: rootId });
      }
    } catch (error) {
      console.error("Error loading levels:", error);
      message.error(Strings.errorLoadingLevels);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const params = {
        siteId: location.state?.siteId,
        rootNode: values.rootNode,
        targetLevel: values.targetLevel,
        groupingLevel: values.groupingLevel,
        dateStart: values.dateStart,
        dateEnd: values.dateEnd,
      };

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
            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label={Strings.selectRootNode} name="rootNode" rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder={Strings.selectRootNodePlaceholder}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={levels.map((l) => ({
                    label: `${l.name} (ID: ${l.id})`,
                    value: l.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label={Strings.groupingLevel} name="groupingLevel">
                <Slider min={0} max={20} tooltip={{ formatter: (value) => `${value}` }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label={Strings.targetLevel} name="targetLevel">
                <Slider min={0} max={20} tooltip={{ formatter: (value) => `${value}` }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={4}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" loading={isLoadingReport} block>
                  {Strings.generateReport}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Space style={{ marginBottom: 16 }}>
          <Button type={chartType === "pie" ? "primary" : "default"} onClick={() => setChartType("pie")}>
            {Strings.pieChart}
          </Button>
          <Button type={chartType === "barV" ? "primary" : "default"} onClick={() => setChartType("barV")}>
            {Strings.verticalBars}
          </Button>
          <Button type={chartType === "barH" ? "primary" : "default"} onClick={() => setChartType("barH")}>
            {Strings.horizontalBars}
          </Button>
        </Space>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title={Strings.charts} size="small">
              <div style={{ height: 400, position: "relative" }}>
                {reportData.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 20px", color: "#6c757d" }}>
                    {Strings.noData}
                  </div>
                ) : chartType === "pie" ? (
                  <Pie data={pieChartData} options={pieChartOptions} />
                ) : chartType === "barV" ? (
                  <Bar data={barChartData} options={barVChartOptions} />
                ) : (
                  <Bar data={barChartData} options={barHChartOptions} />
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
