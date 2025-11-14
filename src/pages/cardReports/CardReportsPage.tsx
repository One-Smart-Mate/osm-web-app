import React, { useState, useEffect, useMemo } from "react";
import { Card, Form, Input, Button, Select, Table, message, Row, Col, Space, Typography, Spin } from "antd";
import { useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useLazyGetCardReportGroupedQuery, useLazyGetCardReportStackedQuery, useGetChartsQuery, useGetChartsLevelsQuery, useLazyGetCardTimeSeriesQuery, usePrefetch } from "../../services/cardService";
import StackedHorizontalChart from "./components/StackedHorizontalChart";
import TimeSeriesChart from "./components/TimeSeriesChart";
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

  // Changed to lazy queries for better caching and parallel loading
  const [getCardReportGrouped, { isLoading: isLoadingReport, isFetching: isFetchingReport }] = useLazyGetCardReportGroupedQuery();
  const [getCardReportStacked, { isLoading: isLoadingStacked, isFetching: isFetchingStacked }] = useLazyGetCardReportStackedQuery();
  const [getCardTimeSeries, { isLoading: isLoadingTimeSeries, isFetching: isFetchingTimeSeries }] = useLazyGetCardTimeSeriesQuery();

  // Prefetch hook for loading chart levels in advance
  const prefetchChartLevels = usePrefetch('getChartsLevels');

  // Track loading start time for performance monitoring
  const [chartsLoadStart] = useState(() => performance.now());

  // Load charts for the site - using optimized defaults from apiSlice
  const { data: chartsData, isLoading: isLoadingCharts, error: chartsError } = useGetChartsQuery(
    { siteId: location.state?.siteId },
    {
      skip: !location.state?.siteId,
      // Removed explicit refetch settings - using optimized apiSlice defaults
    }
  );

  // Log performance when charts finish loading
  useEffect(() => {
    if (!isLoadingCharts && chartsData) {
      const loadTime = performance.now() - chartsLoadStart;
      console.log(`[Performance] Charts loaded in ${loadTime.toFixed(0)}ms`);
    }
  }, [isLoadingCharts, chartsData, chartsLoadStart]);

  // Ensure charts is always an array
  const charts: Chart[] = useMemo(() => {
    const result = Array.isArray(chartsData)
      ? chartsData
      : (chartsData && Array.isArray((chartsData as any).data))
        ? (chartsData as any).data
        : [];
    console.log("[CardReports] Charts loaded:", result.length, "charts");

    // OPTIMIZED: Prefetch levels for ALL charts as soon as charts load
    if (result.length > 0) {
      console.log("[CardReports] Prefetching levels for all", result.length, "charts...");
      result.forEach((chart: Chart) => {
        prefetchChartLevels({ chartId: chart.id });
      });
    }

    return result;
  }, [chartsData, prefetchChartLevels]);

  const [chartType, setChartType] = useState<"pie" | "barV" | "barH" | "line">("pie");
  const [reportData, setReportData] = useState<any[]>([]);
  const [stackedData, setStackedData] = useState<any[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<number | null>(null);

  // Time-series state
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [timeSeriesMode, setTimeSeriesMode] = useState<"daily" | "ma7" | "cumulative">("daily");

  // Helper function to get date in YYYY-MM-DD format with local timezone
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize filters with today and yesterday
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return {
      dateStart: getLocalDateString(yesterday),
      dateEnd: getLocalDateString(today),
      siteId: location.state?.siteId || 0,
      rootNode: 0,
      targetLevel: 4,
      groupingLevel: 2,
      statusFilter: "AR", // Default: Both A (Active) and R (Resolved) - matching PHP demo line 23
    };
  });

  // Track loading start time for levels
  const [levelsLoadStart, setLevelsLoadStart] = useState<number>(0);

  // Load charts_levels for selected chart - using optimized defaults from apiSlice
  const { data: chartsLevelsData, isLoading: isLoadingLevels, error: levelsError } = useGetChartsLevelsQuery(
    { chartId: selectedChartId! },
    {
      skip: !selectedChartId,
      // Removed explicit refetch settings - using optimized apiSlice defaults
    }
  );

  // Track when levels start loading
  useEffect(() => {
    if (isLoadingLevels && levelsLoadStart === 0) {
      setLevelsLoadStart(performance.now());
      console.log(`[Performance] Started loading levels for chart ${selectedChartId}`);
    }
  }, [isLoadingLevels, selectedChartId, levelsLoadStart]);

  // Log performance when levels finish loading
  useEffect(() => {
    if (!isLoadingLevels && chartsLevelsData && levelsLoadStart > 0) {
      const loadTime = performance.now() - levelsLoadStart;
      console.log(`[Performance] Levels loaded in ${loadTime.toFixed(0)}ms`);
      setLevelsLoadStart(0);
    }
  }, [isLoadingLevels, chartsLevelsData, levelsLoadStart]);

  // Ensure chartsLevels is always an array - handle both direct array and {data: array} response
  const chartsLevels = useMemo(() => {
    const result = Array.isArray(chartsLevelsData)
      ? chartsLevelsData
      : (chartsLevelsData && Array.isArray((chartsLevelsData as any).data))
        ? (chartsLevelsData as any).data
        : [];
    console.log("[CardReports] Chart levels loaded:", result.length, "levels");
    return result;
  }, [chartsLevelsData]);

  // Separate grouping and target levels - memoized to avoid recalculation
  const groupingLevels = useMemo(() => {
    return Array.isArray(chartsLevels) ? chartsLevels.filter(l => l.levelType === 'grouping') : [];
  }, [chartsLevels]);

  const targetLevels = useMemo(() => {
    return Array.isArray(chartsLevels) ? chartsLevels.filter(l => l.levelType === 'target') : [];
  }, [chartsLevels]);

  // Check if stacked view is available (need at least 2 grouping levels)
  const stackedViewAvailable = useMemo(() => {
    return groupingLevels.length >= 2 && targetLevels.length >= 1;
  }, [groupingLevels, targetLevels]);

  // Get selected chart data - memoized
  const selectedChart = useMemo(() => {
    return charts.find(c => c.id === selectedChartId);
  }, [charts, selectedChartId]);

  // Handle charts loading errors
  useEffect(() => {
    if (chartsError) {
      console.error("Error loading charts:", chartsError);
      message.error("Error al cargar las gráficas. Por favor recarga la página.");
    }
  }, [chartsError]);

  // Handle levels loading errors
  useEffect(() => {
    if (levelsError) {
      console.error("Error loading chart levels:", levelsError);
      message.error("Error al cargar los niveles de la gráfica.");
    }
  }, [levelsError]);

  // Initialize: Select first chart when charts load and set initial dates
  useEffect(() => {
    // OPTIMIZED: Only run once when charts load (avoid running on every length change)
    if (charts.length > 0 && !selectedChartId && !isLoadingCharts) {
      const firstChart = charts[0];
      console.log("[CardReports] Auto-selecting first chart:", firstChart);
      setSelectedChartId(firstChart.id);
      form.setFieldsValue({
        chartId: firstChart.id,
        dateStart: filters.dateStart,
        dateEnd: filters.dateEnd,
        statusFilter: filters.statusFilter
      });
    }
  }, [charts.length, selectedChartId, isLoadingCharts, form]);

  // When chart changes, update rootNode
  useEffect(() => {
    if (selectedChart) {
      setFilters(prev => ({
        ...prev,
        rootNode: selectedChart.rootNode,
      }));
    }
  }, [selectedChart]);

  // Initialize levels when they first load
  useEffect(() => {
    if (groupingLevels.length > 0 && targetLevels.length > 0) {
      const defaultGroupingLevel = groupingLevels[0].level;
      const defaultTargetLevel = targetLevels[0].level;

      setFilters(prev => ({
        ...prev,
        groupingLevel: defaultGroupingLevel,
        targetLevel: defaultTargetLevel,
      }));

      form.setFieldsValue({
        groupingLevel: defaultGroupingLevel,
        targetLevel: defaultTargetLevel,
      });
    }
  }, [groupingLevels.length, targetLevels.length, form]);

  // Track if we've auto-loaded data
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      const params = {
        siteId: location.state?.siteId,
        rootNode: filters.rootNode,
        targetLevel: values.targetLevel,
        groupingLevel: values.groupingLevel,
        dateStart: values.dateStart,
        dateEnd: values.dateEnd,
        statusFilter: values.statusFilter || "AR",
      };

      if (!params.rootNode) {
        message.error(Strings.pleaseSelectChartFirst);
        return;
      }

      setFilters(params);

      // OPTIMIZED: Load all 3 charts in PARALLEL using Promise.allSettled
      // This reduces total load time significantly compared to sequential loading
      const promises: Promise<{ type: string; data: any[] }>[] = [];

      // 1. Normal grouped report (main chart) - always load
      promises.push(
        getCardReportGrouped(params).unwrap()
          .then(result => ({ type: 'grouped', data: result || [] }))
      );

      // 2. Stacked data if available
      if (stackedViewAvailable && groupingLevels.length >= 2) {
        const stackedParams = {
          siteId: params.siteId,
          rootNode: params.rootNode,
          g1Level: groupingLevels[0].level,
          g2Level: groupingLevels[1].level,
          targetLevel: params.targetLevel,
          dateStart: params.dateStart,
          dateEnd: params.dateEnd,
          statusFilter: params.statusFilter,
        };
        promises.push(
          getCardReportStacked(stackedParams).unwrap()
            .then(result => ({ type: 'stacked', data: result || [] }))
        );
      }

      // 3. Time series data - with rootNode filter for better performance
      const timeSeriesParams = {
        siteId: location.state?.siteId,
        rootNode: params.rootNode, // Filter by tree for faster queries
        dateStart: params.dateStart,
        dateEnd: params.dateEnd,
      };
      promises.push(
        getCardTimeSeries(timeSeriesParams).unwrap()
          .then(result => ({ type: 'timeseries', data: result || [] }))
      );

      // Wait for all requests to complete (even if some fail)
      const results = await Promise.allSettled(promises);

      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { type, data } = result.value as any;
          if (type === 'grouped') {
            setReportData(data);
          } else if (type === 'stacked') {
            setStackedData(data);
          } else if (type === 'timeseries') {
            setTimeSeriesData(data);
          }
        } else {
          console.error(`Error loading ${promises[index]}:`, result.reason);
        }
      });

    } catch (error: any) {
      console.error("Error fetching report:", error);
      message.error(error?.data?.message || Strings.errorLoadingReport);
    }
  };

  const handleLoadTimeSeries = async () => {
    try {
      const params = {
        siteId: location.state?.siteId,
        rootNode: filters.rootNode, // Filter by tree for faster queries
        dateStart: filters.dateStart,
        dateEnd: filters.dateEnd,
      };

      const result = await getCardTimeSeries(params).unwrap();
      setTimeSeriesData(result || []);
    } catch (error: any) {
      message.error(error?.data?.message || "Error cargando datos de serie temporal");
    }
  };

  // Auto-load data with intelligent delay to avoid performance issues
  useEffect(() => {
    // Check if all necessary data is ready
    const isReady =
      selectedChartId &&
      filters.rootNode &&
      groupingLevels.length > 0 &&
      targetLevels.length > 0 &&
      !hasAutoLoaded &&
      !isLoadingCharts &&
      !isLoadingLevels &&
      !isLoadingReport; // Don't auto-load if already loading

    console.log("[CardReports] Auto-load check:", {
      selectedChartId,
      rootNode: filters.rootNode,
      groupingLevelsCount: groupingLevels.length,
      targetLevelsCount: targetLevels.length,
      hasAutoLoaded,
      isLoadingCharts,
      isLoadingLevels,
      isLoadingReport,
      isReady
    });

    if (isReady) {
      console.log("[CardReports] Auto-loading data in 500ms...");
      // OPTIMIZED: Reduced delay from 1000ms to 500ms for faster initial load
      const timer = setTimeout(() => {
        setHasAutoLoaded(true);
        // Submit the form with current values
        form.submit();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    selectedChartId,
    filters.rootNode,
    groupingLevels.length,
    targetLevels.length,
    hasAutoLoaded,
    isLoadingCharts,
    isLoadingLevels,
    isLoadingReport,
    form
  ]);

  // Memoize select options to prevent re-computation on every render
  const chartOptions = useMemo(() => {
    if (!charts || charts.length === 0) return [];
    return charts.map((c) => ({
      label: `${c.rootNode} - ${c.rootName}`,
      value: c.id,
    }));
  }, [charts]);

  const groupingLevelOptions = useMemo(() => {
    if (!groupingLevels || groupingLevels.length === 0) return [];
    return groupingLevels.map((l) => ({
      label: `${l.level} - ${l.levelName}`,
      value: l.level,
    }));
  }, [groupingLevels]);

  const targetLevelOptions = useMemo(() => {
    if (!targetLevels || targetLevels.length === 0) return [];
    return targetLevels.map((l) => ({
      label: `${l.level} - ${l.levelName}`,
      value: l.level,
    }));
  }, [targetLevels]);

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
        title: { display: true, text: Strings.totalCards },
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
        title: { display: true, text: Strings.totalCards },
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
        title: { display: true, text: Strings.totalCards },
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

        {/* Chart info section - shows when a chart is selected */}
        {selectedChart && (
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f5ff' }}>
            <Row gutter={16}>
              <Col span={24}>
                <strong>{Strings.chart || "Chart"}:</strong> {selectedChart.chartName}
              </Col>
              {selectedChart.chartDescription && (
                <Col span={24} style={{ marginTop: 8 }}>
                  <strong>{Strings.description || "Description"}:</strong> {selectedChart.chartDescription}
                </Col>
              )}
            </Row>
          </Card>
        )}

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
                {isLoadingCharts ? (
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <Spin size="small" /> Cargando charts...
                  </div>
                ) : (
                  <Select
                    placeholder={Strings.selectChart || "Select chart"}
                    onChange={(value) => setSelectedChartId(value)}
                    options={chartOptions}
                    showSearch={false}
                    virtual={false}
                    disabled={chartOptions.length === 0}
                  />
                )}
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
                {isLoadingLevels ? (
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <Spin size="small" /> Cargando niveles...
                  </div>
                ) : (
                  <Select
                    disabled={!selectedChartId || groupingLevelOptions.length === 0}
                    placeholder={Strings.selectLevel || "Select level"}
                    options={groupingLevelOptions}
                    showSearch={false}
                    virtual={false}
                  />
                )}
              </Form.Item>
            </Col>

            {/* Target Level select - matching PHP line 327 */}
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label={Strings.targetLevel} name="targetLevel" rules={[{ required: true }]}>
                {isLoadingLevels ? (
                  <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <Spin size="small" /> Cargando niveles...
                  </div>
                ) : (
                  <Select
                    disabled={!selectedChartId || targetLevelOptions.length === 0}
                    placeholder={Strings.selectLevel || "Select level"}
                    options={targetLevelOptions}
                    showSearch={false}
                    virtual={false}
                  />
                )}
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
                <Button type="primary" htmlType="submit" loading={isLoadingReport || isFetchingReport || isLoadingStacked || isFetchingStacked} block>
                  {Strings.generateReport}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Chart type toggle buttons */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <span style={{ fontWeight: 500 }}>{Strings.chartTypeLabel}</span>
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
              {Strings.lineChart}
            </Button>
          </Space>
        </div>

        {/* 1. Vista Normal - Chart with multiple types */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={`${Strings.charts} - ${Strings.normalView || 'Vista Normal'}`}
              size="small"
              extra={
                reportData.length > 0 && (
                  <ChartExpander
                    title={`${Strings.charts} - ${selectedChart?.chartName || ''}`}
                    defaultChartType={chartType}
                    pieChart={
                      <div style={{ height: '100%', position: "relative" }}>
                        <Pie data={pieChartData} options={pieChartOptions} />
                      </div>
                    }
                    barVChart={
                      <div style={{ height: '100%', position: "relative" }}>
                        <Bar data={barChartData} options={barVChartOptions} />
                      </div>
                    }
                    barHChart={
                      <div style={{ height: '100%', position: "relative" }}>
                        <Bar data={barChartData} options={barHChartOptions} />
                      </div>
                    }
                    lineChart={
                      <div style={{ height: '100%', position: "relative" }}>
                        <Line data={lineChartData} options={lineChartOptions} />
                      </div>
                    }
                  />
                )
              }
            >
              <div style={{ height: 400, position: "relative" }}>
                {(isLoadingReport || isFetchingReport) ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: '#1890ff', fontWeight: 500 }}>
                      Cargando datos del gráfico principal...
                    </div>
                  </div>
                ) : reportData.length === 0 ? (
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
              {(isLoadingReport || isFetchingReport) ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16, color: '#1890ff', fontWeight: 500 }}>
                    Cargando detalles...
                  </div>
                </div>
              ) : reportData.length === 0 ? (
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

        {/* 2. Vista Apilada - Always visible */}
        <Card
          title={`${Strings.charts} - ${Strings.stackedView || 'Vista Apilada'}`}
          size="small"
          style={{ marginTop: 24 }}
          extra={
            stackedData.length > 0 && (
              <ChartExpander
                title={`${Strings.charts} - ${selectedChart?.chartName || ''} (${Strings.stackedView})`}
              >
                <StackedHorizontalChart
                  data={stackedData}
                  levelNames={{
                    g1: groupingLevels[0]?.levelName || 'G1',
                    g2: groupingLevels[1]?.levelName || 'G2',
                    target: targetLevels.find(t => t.level === filters.targetLevel)?.levelName || 'Target',
                  }}
                />
              </ChartExpander>
            )
          }
        >
          {(isLoadingStacked || isFetchingStacked) ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#1890ff', fontWeight: 500 }}>
                Cargando gráfico apilado...
              </div>
            </div>
          ) : !stackedViewAvailable ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#6c757d" }}>
              {"Vista apilada requiere al menos 2 niveles de agrupación"}
            </div>
          ) : stackedData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#6c757d" }}>
              {Strings.noData}
            </div>
          ) : (
            <StackedHorizontalChart
              data={stackedData}
              levelNames={{
                g1: groupingLevels[0]?.levelName || 'G1',
                g2: groupingLevels[1]?.levelName || 'G2',
                target: targetLevels.find(t => t.level === filters.targetLevel)?.levelName || 'Target',
              }}
            />
          )}
        </Card>

        {/* 3. Time-series section - Actividad de tarjetas por equipo/posición */}
        <Card
          size="small"
          style={{ marginTop: 24 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <span>{Strings.timeSeriesActivityTitle}</span>
              <Space wrap>
                <span style={{ fontSize: 14, fontWeight: 'normal' }}>{Strings.timeSeriesMode}</span>
                <Select
                  value={timeSeriesMode}
                  onChange={setTimeSeriesMode}
                  style={{ width: 180 }}
                  size="small"
                >
                  <Select.Option value="daily">{Strings.dailyCount}</Select.Option>
                  <Select.Option value="ma7">{Strings.movingAverage7Days}</Select.Option>
                  <Select.Option value="cumulative">{Strings.cumulativeCount}</Select.Option>
                </Select>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleLoadTimeSeries}
                  loading={isLoadingTimeSeries || isFetchingTimeSeries}
                  className="mr-2"
                >
                  {Strings.loadTimeSeries}
                </Button>
              </Space>
            </div>
          }
          extra={
            timeSeriesData.length > 0 && (
              <ChartExpander
                title={`${Strings.timeSeriesActivityTitle || 'Actividad de tarjetas por equipo/posición'}`}
              >
                <TimeSeriesChart
                  data={timeSeriesData}
                  mode={timeSeriesMode}
                  isLoading={isLoadingTimeSeries || isFetchingTimeSeries}
                />
              </ChartExpander>
            )
          }
        >
          <TimeSeriesChart
            data={timeSeriesData}
            mode={timeSeriesMode}
            isLoading={isLoadingTimeSeries}
          />
        </Card>
      </Card>
    </div>
  );
};

export default CardReportsPage;
