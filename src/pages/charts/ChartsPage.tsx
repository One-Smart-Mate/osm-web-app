import { useLocation, useNavigate } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import AreasChart from "./components/AreasChart";
import CreatorsChart from "./components/CreatorsChart";
import WeeksChart from "./components/WeeksChart";
import PreclassifiersChart from "./components/PreclassifiersChart";
import { useEffect, useState } from "react";
import { useGetCardTypesCatalogsMutation } from "../../services/CardTypesService";
import { CardTypesCatalog } from "../../data/cardtypes/cardTypes";
import MethodologiesChart from "./components/MethodologiesChart";
import { Card, DatePicker, Empty, Space, TimeRangePickerProps, Typography } from "antd";
import { useGetMethodologiesChartDataMutation } from "../../services/chartService";
import { Methodology } from "../../data/charts/charts";
import { UnauthorizedRoute } from "../../utils/Routes";
import MachinesChart from "./components/MachinesChart";
import MechanicsChart from "./components/MechanicsChart";
import DefinitiveUsersChart from "./components/DefinitiveUsersChart";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import DownloadChartDataButton from "./components/DownloadChartDataButton";
import ChartExpander from "./components/ChartExpander";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";

const { RangePicker } = DatePicker;

const rangePresets: TimeRangePickerProps["presets"] = [
  { label: Strings.last7days, value: [dayjs().add(-7, "d"), dayjs()] },
  { label: Strings.last14days, value: [dayjs().add(-14, "d"), dayjs()] },
  { label: Strings.last30days, value: [dayjs().add(-30, "d"), dayjs()] },
  { label: Strings.last90days, value: [dayjs().add(-90, "d"), dayjs()] },
];

const ChartsPage = () => {
  const location = useLocation();
  const [getMethodologiesCatalog] = useGetCardTypesCatalogsMutation();
  const [getMethodologies] = useGetMethodologiesChartDataMutation();
  const [methodologiesCatalog, setMethodologiesCatalog] = useState<
    CardTypesCatalog[]
  >([]);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(Strings.empty);
  const [endDate, setEndDate] = useState(Strings.empty);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(
    undefined
  );
  const [selectedAreaName, setSelectedAreaName] = useState<string>("");
  const { isIhAdmin } = useCurrentUser();
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state?.siteId || Strings.empty;


  const handleGetMethodologiesCatalog = async (): Promise<void> => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setIsLoading(true);
    const [response, response2] = await Promise.all([
      getMethodologiesCatalog().unwrap(),
      getMethodologies({
        siteId,
        startDate,
        endDate,
      }).unwrap(),
    ]);

    setMethodologiesCatalog(response);
    setMethodologies(response2);
    setIsLoading(false);
  };

  useEffect(() => {
    if (location.state?.siteId) {
      handleGetMethodologiesCatalog();
    }
  }, [location.state?.siteId, startDate, endDate]);


  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (dates) {
      if (dateStrings[0] !== startDate || dateStrings[1] !== endDate) {
        setStartDate(dateStrings[0]);
        setEndDate(dateStrings[1]);
      }
    } else {
      setStartDate(Strings.empty);
      setEndDate(Strings.empty);
    }
  };

  return (
    <MainContainer
      title={Strings.chartsOf}
      description={siteName}
      isLoading={isLoading}
      enableBackButton={isIhAdmin()}
      enableSearch={false}
      content={
        <div>
          <div className="flex items-end justify-end">
            <DownloadChartDataButton siteId={siteId} />
          </div>
          <Space className="w-full md:w-auto mb-1 md:mb-0 pb-2">
            <RangePicker presets={rangePresets} onChange={onRangeChange} />
          </Space>
          {methodologies.length > 0 ? (
            <>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <Typography.Title level={4}>
                          {Strings.anomalies}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.anomalies}>
                          <PreclassifiersChart
                            siteId={siteId}
                            startDate={startDate}
                            endDate={endDate}
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="flex flex-col gap-2">
                    <div className="md:w-full justify-center flex flex-wrap gap-2 w-full">
                      {methodologies.map((m, index) => (
                        <div key={index} className="flex gap-1">
                          <div
                            className="w-5 rounded-lg border border-black"
                            style={{
                              background: `#${m.color}`,
                            }}
                          />
                          <h1 className="md:text-sm text-xs">
                            {m.methodology}
                          </h1>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <div className="md:flex-1 w-full h-60">
                        <PreclassifiersChart
                          siteId={siteId}
                          startDate={startDate}
                          endDate={endDate}
                        />
                      </div>
                      <div className="md:w-80 w-full h-60">
                        <MethodologiesChart
                          methodologies={methodologies}
                          methodologiesCatalog={methodologiesCatalog}
                          siteId={siteId}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <Typography.Title level={4}>
                          {Strings.areas}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.areas}>
                          <AreasChart
                            startDate={startDate}
                            endDate={endDate}
                            methodologies={methodologies}
                            siteId={siteId}
                            onClick={(superiorId, areaName) => {
                              setSelectedAreaId(superiorId);
                              setSelectedAreaName(areaName || "");
                            }}
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <AreasChart
                      startDate={startDate}
                      endDate={endDate}
                      methodologies={methodologies}
                      siteId={siteId}
                      onClick={(superiorId, areaName) => {
                        setSelectedAreaId(superiorId);
                        setSelectedAreaName(areaName || "");
                      }}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <Typography.Title level={4}>
                         {selectedAreaName
                            ? `${Strings.machinesOfArea}: ${selectedAreaName}`
                            : Strings.machines}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander
                          title={
                            selectedAreaName
                              ? `${Strings.machinesOfArea}: ${selectedAreaName}`
                              : Strings.machines
                          }
                        >
                          <MachinesChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            methodologies={methodologies}
                            areaId={selectedAreaId}
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <MachinesChart
                      startDate={startDate}
                      endDate={endDate}
                      siteId={siteId}
                      methodologies={methodologies}
                      areaId={selectedAreaId}
                    />
                  </div>
                </Card>
              </div>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <Typography.Title level={4}>
                         {Strings.creators}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.creators}>
                          <CreatorsChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            methodologies={methodologies}
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <CreatorsChart
                      startDate={startDate}
                      endDate={endDate}
                      siteId={siteId}
                      methodologies={methodologies}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                         <Typography.Title level={4}>
                         {selectedAreaName
                            ? `${Strings.mechanics}: ${selectedAreaName}`
                            : Strings.mechanics}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander
                          title={
                            selectedAreaName
                              ? `${Strings.machines}: ${selectedAreaName}`
                              : Strings.mechanics
                          }
                        >
                          <MechanicsChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            methodologies={methodologies}
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <MechanicsChart
                      startDate={startDate}
                      endDate={endDate}
                      siteId={siteId}
                      methodologies={methodologies}
                    />
                  </div>
                </Card>
              </div>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                         <Typography.Title level={4}>
                         {Strings.definitiveUsers}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.definitiveUsers}>
                          <DefinitiveUsersChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            methodologies={methodologies}
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <DefinitiveUsersChart
                      startDate={startDate}
                      endDate={endDate}
                      siteId={siteId}
                      methodologies={methodologies}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                         <Typography.Title level={4}>
                         {Strings.tagMonitoring}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.tagMonitoring}>
                          <WeeksChart siteId={siteId} />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <WeeksChart siteId={siteId} />
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      }
    />
  );
};

export default ChartsPage;