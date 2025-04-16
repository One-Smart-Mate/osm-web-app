import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import Strings from "../../utils/localizations/Strings";
import AreasChart from "./components/AreasChart";
import CreatorsChart from "./components/CreatorsChart";
import WeeksChart from "./components/WeeksChart";
import PreclassifiersChart from "./components/PreclassifiersChart";
import { useEffect, useState } from "react";
import { useGetCardTypesCatalogsMutation } from "../../services/CardTypesService";
import { CardTypesCatalog } from "../../data/cardtypes/cardTypes";
import MethodologiesChart from "./components/MethodologiesChart";
import { Card, DatePicker, Empty, Space, TimeRangePickerProps } from "antd";
import { useGetMethodologiesChartDataMutation } from "../../services/chartService";
import { Methodology } from "../../data/charts/charts";
import { UnauthorizedRoute } from "../../utils/Routes";
import MachinesChart from "./components/MachinesChart";
import MechanicsChart from "./components/MechanicsChart";
import DefinitiveUsersChart from "./components/DefinitiveUsersChart";
import { UserRoles } from "../../utils/Extensions";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import DownloadCarDataExceButton from "./components/DownloadCardDataExcelButton";
import ChartExpander from "./components/ChartExpander";

const { RangePicker } = DatePicker;

const rangePresets: TimeRangePickerProps["presets"] = [
  { label: Strings.last7days, value: [dayjs().add(-7, "d"), dayjs()] },
  { label: Strings.last14days, value: [dayjs().add(-14, "d"), dayjs()] },
  { label: Strings.last30days, value: [dayjs().add(-30, "d"), dayjs()] },
  { label: Strings.last90days, value: [dayjs().add(-90, "d"), dayjs()] },
];

interface Props {
  rol: UserRoles;
}

const Charts = ({ rol }: Props) => {
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

  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(
    undefined
  );

  const handleGetMethodologiesCatalog = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
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
  };

  useEffect(() => {
    handleGetMethodologiesCatalog();
  }, [location.state]);

  useEffect(() => {
    handleGetMethodologiesCatalog();
  }, [startDate, endDate]);

  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state?.siteId || Strings.empty;

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (dates) {
      setStartDate(dateStrings[0]);
      setEndDate(dateStrings[1]);
    } else {
      setStartDate(Strings.empty);
      setEndDate(Strings.empty);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex flex-col gap-2 items-center m-3">
          <div className="flex flex-wrap gap-2">
            <PageTitle mainText={Strings.usersOf} subText={siteName} />
            <div className=" flex items-center">
              <DownloadCarDataExceButton siteId={siteId} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row flex-wrap items-center md:justify-between w-full">
            <div className="flex flex-col md:flex-row items-center flex-1 mb-1 md:mb-0">
              <Space className="w-full md:w-auto mb-1 md:mb-0">
                <RangePicker presets={rangePresets} onChange={onRangeChange} />
              </Space>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {methodologies.length > 0 ? (
            <>
              <div className="mb-2 flex flex-wrap flex-row gap-2">
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-black">
                          {Strings.anomalies}
                        </h2>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.anomalies}>
                          <PreclassifiersChart
                            siteId={siteId}
                            startDate={startDate}
                            endDate={endDate}
                            rol={rol}
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
                          rol={rol}
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
                        <h2 className="text-xl font-semibold text-black">
                          {Strings.areas}
                        </h2>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.areas}>
                          <AreasChart
                            startDate={startDate}
                            endDate={endDate}
                            methodologies={methodologies}
                            siteId={siteId}
                            rol={rol}
                            onAreaSelect={(superiorId) =>
                              setSelectedAreaId(superiorId)
                            }
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
                      rol={rol}
                      onAreaSelect={(superiorId) =>
                        setSelectedAreaId(superiorId)
                      }
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-black">
                          {Strings.machines}
                        </h2>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.machines}>
                          <MachinesChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            methodologies={methodologies}
                            rol={rol}
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
                      rol={rol}
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
                        <h2 className="text-xl font-semibold text-black">
                          {Strings.creators}
                        </h2>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.creators}>
                          <CreatorsChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            methodologies={methodologies}
                            rol={rol}
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
                      rol={rol}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-black">
                          {Strings.mechanics}
                        </h2>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.mechanics}>
                          <MechanicsChart
                            startDate={startDate}
                            endDate={endDate}
                            rol={rol}
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
                      rol={rol}
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
                        <h2 className="text-xl font-semibold text-black">
                          {Strings.definitiveUsers}
                        </h2>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.definitiveUsers}>
                          <DefinitiveUsersChart
                            startDate={startDate}
                            endDate={endDate}
                            rol={rol}
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
                      rol={rol}
                      siteId={siteId}
                      methodologies={methodologies}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-black">
                          {Strings.tagMonitoring}
                        </h2>
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
      </div>
    </>
  );
};

export default Charts;
