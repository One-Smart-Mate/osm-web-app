import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Typography, DatePicker, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { CiltChartFilters } from "../../services/chartService";
import { UnauthorizedRoute } from "../../utils/Routes";
import Strings from "../../utils/localizations/Strings";
import PageTitle from "../components/PageTitle";
import ExecutionChart from "./components/ExecutionChart";
import ComplianceChart from "./components/ComplianceChart";
import TimeChart from "./components/TimeChart";
import AnomaliesChart from "./components/AnomaliesChart";
import ChartExpander from "./components/ChartExpander";

const { RangePicker } = DatePicker;

const CiltChartsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<CiltChartFilters>({
    startDate: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    siteId: undefined,
    positionId: undefined,
    levelId: undefined,
  });

  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state?.siteId || Strings.empty;

  useEffect(() => {
    if (!location.state?.siteId) {
      navigate(UnauthorizedRoute);
      return;
    }
    
    // Set siteId in filters
    setFilters(prev => ({
      ...prev,
      siteId: parseInt(siteId)
    }));
  }, [location.state?.siteId, navigate, siteId]);

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      }));
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Force re-render by updating filters
    setFilters(prev => ({ ...prev }));
    setTimeout(() => setIsLoading(false), 1000);
  };

  const rangePresets = [
    { 
      label: Strings.last7days, 
      value: () => [dayjs().subtract(7, 'days'), dayjs()] as [Dayjs, Dayjs]
    },
    { 
      label: Strings.last14days, 
      value: () => [dayjs().subtract(14, 'days'), dayjs()] as [Dayjs, Dayjs]
    },
    { 
      label: Strings.last30days, 
      value: () => [dayjs().subtract(30, 'days'), dayjs()] as [Dayjs, Dayjs]
    },
    { 
      label: Strings.last90days, 
      value: () => [dayjs().subtract(90, 'days'), dayjs()] as [Dayjs, Dayjs]
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle mainText={`${Strings.ciltChartsOf} ${siteName}`} />
        
        <div className="flex flex-wrap gap-2 items-center">
          <RangePicker
            value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            presets={rangePresets}
            className="min-w-[250px]"
          />
          
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
            size="middle"
          >
            {Strings.refresh}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Chart */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <Typography.Title level={4} className="mb-0">
                {Strings.executionCiltChart}
              </Typography.Title>
              <ChartExpander title={Strings.executionCiltChart}>
                <ExecutionChart filters={filters} />
              </ChartExpander>
            </div>
          }
          className="h-96"
        >
          <div className="h-72">
            <ExecutionChart filters={filters} />
          </div>
        </Card>

        {/* Compliance Chart */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <Typography.Title level={4} className="mb-0">
                {Strings.complianceCiltChart}
              </Typography.Title>
              <ChartExpander title={Strings.complianceCiltChart}>
                <ComplianceChart filters={filters} />
              </ChartExpander>
            </div>
          }
          className="h-96"
        >
          <div className="h-72">
            <ComplianceChart filters={filters} />
          </div>
        </Card>

        {/* Time Chart */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <Typography.Title level={4} className="mb-0">
                {Strings.timeCiltChart}
              </Typography.Title>
              <ChartExpander title={Strings.timeCiltChart}>
                <TimeChart filters={filters} />
              </ChartExpander>
            </div>
          }
          className="h-96"
        >
          <div className="h-72">
            <TimeChart filters={filters} />
          </div>
        </Card>

        {/* Anomalies Chart */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <Typography.Title level={4} className="mb-0 text-sm md:text-base">
                {Strings.anomaliesCiltChart}
              </Typography.Title>
              <ChartExpander title={Strings.anomaliesCiltChart}>
                <AnomaliesChart filters={filters} />
              </ChartExpander>
            </div>
          }
          className="h-96"
        >
          <div className="h-72">
            <AnomaliesChart filters={filters} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CiltChartsPage;
