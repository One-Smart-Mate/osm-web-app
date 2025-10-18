import { useLocation, useNavigate } from "react-router-dom";
import Strings from "../../utils/localizations/Strings";
import AreasChart from "./components/AreasChart";
import CreatorsChart from "./components/CreatorsChart";
import WeeksChart from "./components/WeeksChart";
import PreclassifiersChart from "./components/PreclassifiersChart";
import DiscardedCardsChart from "./components/DiscardedCardsChart";
import { useEffect, useState } from "react";
import { useGetCardTypesCatalogsMutation, useGetCardTypesMutation } from "../../services/CardTypesService";
import { CardTypesCatalog, CardTypes } from "../../data/cardtypes/cardTypes";
import MethodologiesChart from "./components/MethodologiesChart";
import { Card, DatePicker, Empty, Space, TimeRangePickerProps, Typography, Select } from "antd";
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
  const [getCardTypes] = useGetCardTypesMutation();
  const [methodologiesCatalog, setMethodologiesCatalog] = useState<
    CardTypesCatalog[]
  >([]);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [cardTypes, setCardTypes] = useState<CardTypes[]>([]);
  const [selectedCardType, setSelectedCardType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("A");
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
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
    const [response, response2, cardTypesResponse] = await Promise.all([
      getMethodologiesCatalog().unwrap(),
      getMethodologies({
        siteId,
        startDate,
        endDate,
        status: selectedStatus,
      }).unwrap(),
      getCardTypes(siteId).unwrap()
    ]);

    setMethodologiesCatalog(response);
    setMethodologies(response2);
    setCardTypes(cardTypesResponse);
    setIsLoading(false);
  };

  useEffect(() => {
    if (location.state?.siteId) {
      handleGetMethodologiesCatalog();
    }
  }, [location.state?.siteId, startDate, endDate, selectedStatus]);


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
  
  const handleCardTypeChange = (value: string | null) => {
    setSelectedCardType(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
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
            <DownloadChartDataButton 
              siteId={siteId} 
              startDate={startDate}
              endDate={endDate}
              cardTypeName={selectedCardType}
            />
          </div>
          <Space className="w-full flex flex-wrap gap-2 mb-1 md:mb-0 pb-2">
            <RangePicker
              presets={rangePresets}
              onChange={onRangeChange}
              defaultValue={[dayjs(), dayjs()]}
            />
            <Select
              placeholder={Strings.filterByCardType}
              style={{ minWidth: 200 }}
              allowClear
              onChange={handleCardTypeChange}
              options={[
                { value: null, label: Strings.allCardTypes },
                ...cardTypes.map((type) => ({ value: type.name, label: type.name }))
              ]}
            />
            <Select
              value={selectedStatus}
              style={{ minWidth: 180 }}
              onChange={handleStatusChange}
              options={[
                { value: "A", label: "Solo Abiertas" },
                { value: "A,C,R", label: "Abiertas y Cerradas" },
              ]}
            />
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
                            cardTypeName={selectedCardType}
                            status={selectedStatus}
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
                          cardTypeName={selectedCardType}
                          status={selectedStatus}
                        />
                      </div>
                      <div className="md:w-80 w-full h-60">
                        <MethodologiesChart
                          methodologies={methodologies}
                          methodologiesCatalog={methodologiesCatalog}
                          siteId={siteId}
                          cardTypeName={selectedCardType}
                          status={selectedStatus}
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
                        <ChartExpander title={Strings.preclassifierChart}>
                          <PreclassifiersChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            cardTypeName={selectedCardType}
                            status={selectedStatus}
                          />
                        </ChartExpander>
                        <AreasChart
                          startDate={startDate}
                          endDate={endDate}
                          methodologies={methodologies}
                          siteId={siteId}
                          status={selectedStatus}
                          onClick={(superiorId, areaName) => {
                            setSelectedAreaId(superiorId);
                            setSelectedAreaName(areaName || "");
                          }}
                        />
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
                      cardTypeName={selectedCardType}
                      status={selectedStatus}
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
                        <Typography.Title level={4} className="pr-10 mb-2">
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
                            areaName={selectedAreaName}
                            cardTypeName={selectedCardType}
                            status={selectedStatus}
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
                      areaName={selectedAreaName}
                      cardTypeName={selectedCardType}
                      status={selectedStatus}
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
                            cardTypeName={selectedCardType}
                            status={selectedStatus}
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
                      cardTypeName={selectedCardType}
                      status={selectedStatus}
                    />
                  </div>
                </Card>
                <Card
                  title={
                    <div className="mt-2 relative">
                      <div className="flex flex-col items-center">
                         <Typography.Title level={4}>
                         {selectedAreaName
                            ? `${Strings.mechanics}`
                            : Strings.mechanics}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander
                          title={
                            selectedAreaName
                              ? `${Strings.mechanics}`
                              : Strings.mechanics
                          }
                        >
                          <MechanicsChart
                            startDate={startDate}
                            endDate={endDate}
                            siteId={siteId}
                            methodologies={methodologies}
                            cardTypeName={selectedCardType}
                            status={selectedStatus}
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
                      cardTypeName={selectedCardType}
                      status={selectedStatus}
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
                            cardTypeName={selectedCardType}
                            status={"C,R"}
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
                      cardTypeName={selectedCardType}
                      status={"C,R"}
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
                          <WeeksChart 
                            siteId={siteId} 
                            startDate={startDate}
                            endDate={endDate}
                            cardTypeName={selectedCardType}
                            status={selectedStatus} 
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <WeeksChart 
                      siteId={siteId} 
                      startDate={startDate}
                      endDate={endDate}
                      cardTypeName={selectedCardType}
                      status={selectedStatus} 
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
                         {Strings.discardedCardslCardsTitle}
                        </Typography.Title>
                      </div>
                      <div className="absolute right-0 top-0">
                        <ChartExpander title={Strings.discardedCardslCardsTitle}>
                          <DiscardedCardsChart 
                            siteId={siteId} 
                            startDate={startDate}
                            endDate={endDate}
                            cardTypeName={selectedCardType} 
                          />
                        </ChartExpander>
                      </div>
                    </div>
                  }
                  className="md:flex-1 w-full mx-auto bg-gray-100 rounded-xl shadow-md"
                >
                  <div className="w-full h-60">
                    <DiscardedCardsChart 
                      siteId={siteId} 
                      startDate={startDate}
                      endDate={endDate}
                      cardTypeName={selectedCardType} 
                    />
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