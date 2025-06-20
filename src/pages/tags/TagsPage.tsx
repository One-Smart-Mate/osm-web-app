import { useCallback, useEffect, useMemo, useState } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCardsMutation } from "../../services/cardService";
import { CardInterface } from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { useDebounce } from "use-debounce";
import { handleErrorNotification } from "../../utils/Notifications";
import TagList from "../components/TagList";
import { Button, Select, Input, Card, DatePicker, Space, Typography, TimeRangePickerProps, Divider } from "antd";
import { BsSortDown, BsCalendarRange } from "react-icons/bs";
import dayjs, { Dayjs } from "dayjs";
import { FilterOutlined } from "@ant-design/icons";

type SortOption = 'dueDate-asc' | 'dueDate-desc' | 'creationDate-asc' | 'creationDate-desc' | '';
type DateFilterType = 'creation' | 'due' | '';

const { RangePicker } = DatePicker;

const rangePresets: TimeRangePickerProps["presets"] = [
  { label: Strings.last7days, value: [dayjs().add(-7, "d"), dayjs()] },
  { label: Strings.last14days, value: [dayjs().add(-14, "d"), dayjs()] },
  { label: Strings.last30days, value: [dayjs().add(-30, "d"), dayjs()] },
  { label: Strings.last90days, value: [dayjs().add(-90, "d"), dayjs()] },
];

const TagsPage = () => {
  const [getCards] = useGetCardsMutation();
  const [isLoading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState<CardInterface[]>([]);
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const { isIhAdmin } = useCurrentUser();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("");
  const [cardNumber, setCardNumber] = useState("");
  const [debouncedCardNumber] = useDebounce(cardNumber, 300);
  const [location_, setLocation] = useState("");
  const [debouncedLocation] = useDebounce(location_, 300);
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("");
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  
  const search = useCallback((item: CardInterface, query: string) => {
    const normalizedQuery = query.toLowerCase();
  
    return (
      item.creatorName.toLowerCase().includes(normalizedQuery) ||
      item.areaName.toLowerCase().includes(normalizedQuery) ||
      item.cardTypeMethodologyName.toLowerCase().includes(normalizedQuery)
    );
  }, []);
  
  // Filter by card number
  const filterByCardNumber = useCallback((item: CardInterface, cardNum: string) => {
    if (!cardNum) return true;
    return item.siteCardId.toString().includes(cardNum);
  }, []);
  
  // Filter by location
  const filterByLocation = useCallback((item: CardInterface, loc: string) => {
    if (!loc) return true;
    const normalizedLocation = loc.toLowerCase();
    return item.cardLocation.toLowerCase().includes(normalizedLocation);
  }, []);
  
  // Filter by date range
  const filterByDateRange = useCallback((item: CardInterface, dateType: DateFilterType, range: [Dayjs, Dayjs] | null) => {
    if (!range || !dateType) return true;
    
    const [startDate, endDate] = range;
    const startTimestamp = startDate.startOf('day').valueOf();
    const endTimestamp = endDate.endOf('day').valueOf();
    
    if (dateType === 'creation') {
      const creationDate = new Date(item.cardCreationDate).getTime();
      return creationDate >= startTimestamp && creationDate <= endTimestamp;
    } else if (dateType === 'due') {
      if (!item.cardDueDate) return false;
      const dueDate = new Date(item.cardDueDate).getTime();
      return dueDate >= startTimestamp && dueDate <= endTimestamp;
    }
    
    return true;
  }, []);
  
  // Sort function based on selected option
  const sortCards = useCallback((a: CardInterface, b: CardInterface, option: SortOption) => {
    switch(option) {
      case 'dueDate-asc':
        return new Date(a.cardDueDate || '9999-12-31').getTime() - new Date(b.cardDueDate || '9999-12-31').getTime();
      case 'dueDate-desc':
        return new Date(b.cardDueDate || '9999-12-31').getTime() - new Date(a.cardDueDate || '9999-12-31').getTime();
      case 'creationDate-asc':
        return new Date(a.cardCreationDate).getTime() - new Date(b.cardCreationDate).getTime();
      case 'creationDate-desc':
        return new Date(b.cardCreationDate).getTime() - new Date(a.cardCreationDate).getTime();
      default:
        return 0;
    }
  }, []);

  const handleGetCards = async () => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }
    setLoading(true);
    try {
      const response = await getCards(location.state.siteId).unwrap();
      setData(response);
    } catch (error) {
      handleErrorNotification(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetCards();
  }, [location.state]);

  const filteredData = useMemo(() => {
    if (!data || !data.length) return [];

    // Apply filters
    let filteredResults = data;

    // Text search filter removed as we're using custom filters instead

    // Card number filter
    if (debouncedCardNumber) {
      filteredResults = filteredResults.filter(item => filterByCardNumber(item, debouncedCardNumber));
    }

    // Location filter
    if (debouncedLocation) {
      filteredResults = filteredResults.filter(item => filterByLocation(item, debouncedLocation));
    }

    // Date range filter
    if (dateRange && dateFilterType) {
      filteredResults = filteredResults.filter(item =>
        filterByDateRange(item, dateFilterType, dateRange));
    }

    // Apply sorting if option is selected
    if (sortOption) {
      filteredResults = [...filteredResults].sort((a, b) => sortCards(a, b, sortOption));
    }

    return filteredResults;
  }, [data, debouncedCardNumber, debouncedLocation, dateRange, dateFilterType, sortOption, search, filterByCardNumber, filterByLocation, filterByDateRange, sortCards]);

  // Sort options for dropdown
  const sortOptions = [
    { value: '', label: Strings.noSort },
    { value: 'dueDate-asc', label: `${Strings.dueDate} (${Strings.ascending})` },
    { value: 'dueDate-desc', label: `${Strings.dueDate} (${Strings.descending})` },
    { value: 'creationDate-asc', label: `${Strings.creationDate} (${Strings.ascending})` },
    { value: 'creationDate-desc', label: `${Strings.creationDate} (${Strings.descending})` },
  ];

  return (
    <MainContainer
      title={Strings.tagsOf}
      description={siteName}
      enableSearch={false}
      enableBackButton={isIhAdmin()}
      isLoading={isLoading}
      content={
        <>
          {/* Filter section */}
          <Card className="mb-4">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                style={{ borderRadius: '6px' }}
              >
                {showFilters ? Strings.close : Strings.filters}
              </Button>
            </div>

            <Card
              style={{
                marginBottom: '16px',
                display: showFilters ? 'block' : 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Typography.Title level={5}>{Strings.filters}</Typography.Title>
              <Divider style={{ margin: '12px 0' }} />

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Sort Options */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <BsSortDown style={{ marginRight: '8px' }} />
                    <Typography.Text strong>{Strings.sortBy}</Typography.Text>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    value={sortOption}
                    onChange={(value) => setSortOption(value)}
                    options={sortOptions}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Card Number Filter */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <Typography.Text strong>{Strings.cardNumber}</Typography.Text>
                    </div>
                    <Input
                      placeholder={Strings.enterCardNumber}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>

                  {/* Location Filter */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <Typography.Text strong>{Strings.location}</Typography.Text>
                    </div>
                    <Input
                      placeholder={Strings.enterLocation}
                      value={location_}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <BsCalendarRange style={{ marginRight: '8px' }} />
                    <Typography.Text strong>{Strings.dateRange}</Typography.Text>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px', marginBottom: '12px' }}>
                      <Select
                        style={{ width: '100%', marginBottom: '8px' }}
                        value={dateFilterType}
                        placeholder={Strings.selectDates}
                        onChange={(value) => setDateFilterType(value)}
                        options={[
                          { value: '', label: Strings.selectDates },
                          { value: 'creation', label: Strings.creationDateFilter },
                          { value: 'due', label: Strings.dueDateFilter },
                        ]}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <RangePicker
                        style={{ width: '100%' }}
                        presets={rangePresets}
                        disabled={!dateFilterType}
                        onChange={(dates) => setDateRange(dates)}
                        placeholder={[Strings.startDate, Strings.endDate]}
                      />
                    </div>
                  </div>
                </div>
              </Space>
            </Card>
          </Card>

          {/* Tag list */}
          <TagList data={filteredData} isLoading={isLoading} isResponsive={true} />
        </>
      }
    />
  );
};

export default TagsPage;
