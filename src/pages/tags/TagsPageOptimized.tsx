import { useEffect, useMemo, useState, useRef } from "react";
import Strings from "../../utils/localizations/Strings";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCardsPaginatedMutation } from "../../services/cardService";
import { CardInterface } from "../../data/card/card";
import { UnauthorizedRoute } from "../../utils/Routes";
import MainContainer from "../layouts/MainContainer";
import useCurrentUser from "../../utils/hooks/useCurrentUser";
import { useDebounce } from "use-debounce";
import { handleErrorNotification } from "../../utils/Notifications";
import TagCard from "./components/TagCard";
import CreateCardModal from "./CreateCardModal";
import { Button, Select, Input, Card, DatePicker, Space, Typography, TimeRangePickerProps, Divider, List, Progress } from "antd";
import { BsSortDown, BsCalendarRange } from "react-icons/bs";
import dayjs, { Dayjs } from "dayjs";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { getUserRol, UserRoles, RESPONSIVE_LIST } from "../../utils/Extensions";
import { CardCache } from "../../utils/cardCache";
import Constants from "../../utils/Constants";

type SortOption = 'dueDate-asc' | 'dueDate-desc' | 'creationDate-asc' | 'creationDate-desc' | '';
type DateFilterType = 'creation' | 'due' | '';

const { RangePicker } = DatePicker;

const rangePresets: TimeRangePickerProps["presets"] = [
  { label: Strings.last7days, value: [dayjs().add(-7, "d"), dayjs()] },
  { label: Strings.last14days, value: [dayjs().add(-14, "d"), dayjs()] },
  { label: Strings.last30days, value: [dayjs().add(-30, "d"), dayjs()] },
  { label: Strings.last90days, value: [dayjs().add(-90, "d"), dayjs()] },
];

const TagsPageOptimized = () => {
  const [getCardsPaginated] = useGetCardsPaginatedMutation();
  const [isLoading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const location = useLocation();
  const [data, setData] = useState<CardInterface[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(Constants.PAGE_SIZE);
  const navigate = useNavigate();
  const siteName = location?.state?.siteName || Strings.empty;
  const siteId = location?.state?.siteId;
  const { isIhAdmin, user } = useCurrentUser();
  const userRole = user ? getUserRol(user) : UserRoles._UNDEFINED;

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("");
  const [cardNumber, setCardNumber] = useState("");
  const [debouncedCardNumber] = useDebounce(cardNumber, 300);
  const [location_, setLocation] = useState("");
  const [debouncedLocation] = useDebounce(location_, 300);
  const [levelMachineId, setLevelMachineId] = useState("");
  const [debouncedLevelMachineId] = useDebounce(levelMachineId, 300);
  const [creator, setCreator] = useState("");
  const [debouncedCreator] = useDebounce(creator, 300);
  const [resolver, setResolver] = useState("");
  const [debouncedResolver] = useDebounce(resolver, 300);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("A,P");

  // Role-based "My Cards" filter
  // Operators and Mechanics: default to showing only their cards
  // Other roles: default to showing all cards
  const [showMyCardsOnly, setShowMyCardsOnly] = useState<boolean>(
    userRole === UserRoles._OPERATOR || userRole === UserRoles._MECHANIC
  );

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Ref to track if we've loaded initial data
  const initialLoadRef = useRef(false);

  // Build filters object
  const filters = useMemo(() => {
    // Determine if we should filter by "my cards"
    // Operators: ALWAYS filter to their cards only (no option to see all)
    // Mechanics: Controlled by showMyCardsOnly toggle
    // Other roles: Controlled by showMyCardsOnly toggle (default false)
    const shouldFilterMyCards = userRole === UserRoles._OPERATOR
      ? true
      : showMyCardsOnly;

    return {
      searchText: debouncedSearchText,
      cardNumber: debouncedCardNumber,
      location: debouncedLocation,
      levelMachineId: debouncedLevelMachineId,
      creator: debouncedCreator,
      resolver: debouncedResolver,
      dateFilterType,
      startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
      endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
      sortOption,
      status: selectedStatus,
      userId: user?.userId ? parseInt(user.userId) : undefined,
      myCards: shouldFilterMyCards,
    };
  }, [debouncedSearchText, debouncedCardNumber, debouncedLocation, debouncedLevelMachineId, debouncedCreator, debouncedResolver, dateFilterType, dateRange, sortOption, selectedStatus, userRole, showMyCardsOnly, user?.userId]);

  const handleGetCards = async (page: number = 1) => {
    if (!location.state) {
      navigate(UnauthorizedRoute);
      return;
    }

    setLoading(true);
    setLoadingProgress(10);

    try {
      // Check cache first
      const cachedPage = await CardCache.getCachedPage(siteId, page, pageSize, filters);

      if (cachedPage) {
        setData(cachedPage.cards);
        setTotal(cachedPage.total);
        setCurrentPage(page);
        setLoading(false);
        setLoadingProgress(0);
        return;
      }

      setLoadingProgress(30);

      const response = await getCardsPaginated({
        siteId: siteId.toString(),
        page,
        limit: pageSize,
        filters,
      }).unwrap();

      setLoadingProgress(70);

      // Backend now handles all role-based filtering via myCards and userId filters
      // Cache the result
      await CardCache.cachePage(siteId, page, pageSize, filters, {
        cards: response.cards,
        total: response.total,
        totalPages: response.totalPages,
        hasMore: response.hasMore,
      });

      setLoadingProgress(100);
      setData(response.cards);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      handleErrorNotification(error);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialLoadRef.current && location.state) {
      initialLoadRef.current = true;
      handleGetCards(1);
    }
  }, [location.state]);

  // Reload when filters change
  useEffect(() => {
    if (initialLoadRef.current) {
      setCurrentPage(1);
      handleGetCards(1);
    }
  }, [filters, pageSize]);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCardCreated = async () => {
    // Clear cache and reload
    await CardCache.clearSiteCache(siteId);
    setCurrentPage(1);
    handleGetCards(1);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
      handleGetCards(1);
    } else {
      setCurrentPage(page);
      handleGetCards(page);
    }
  };

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
      isLoading={isLoading && data.length === 0}
      disableContentScroll={true}
      content={
        <>
          {/* Loading Progress */}
          {loadingProgress > 0 && loadingProgress < 100 && (
            <div style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Progress
                percent={loadingProgress}
                status="active"
                style={{ minWidth: 200 }}
              />
            </div>
          )}

          {/* Action buttons and Filter section */}
          <Card className="mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              {/* Create button available for all roles except undefined */}
              {userRole !== UserRoles._UNDEFINED && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreateModal}
                  style={{ borderRadius: '6px' }}
                >
                  {Strings.createCard || "Create Card"}
                </Button>
              )}

              <div style={{ display: 'flex', gap: '8px', marginLeft: userRole === UserRoles._OPERATOR ? 'auto' : '0' }}>
                {/* Toggle button for Mechanics and other roles (NOT for Operators) */}
                {userRole !== UserRoles._UNDEFINED && userRole !== UserRoles._OPERATOR && (
                  <Button
                    type={showMyCardsOnly ? "default" : "primary"}
                    onClick={() => setShowMyCardsOnly(!showMyCardsOnly)}
                    style={{ borderRadius: '6px' }}
                  >
                    {showMyCardsOnly ? Strings.allCards : Strings.myCards}
                  </Button>
                )}

                <Button
                  type="default"
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ borderRadius: '6px' }}
                >
                  {showFilters ? Strings.close : Strings.filters}
                </Button>
              </div>
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
                {/* General Search */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography.Text strong>{Strings.search}</Typography.Text>
                  </div>
                  <Input
                    placeholder={`${Strings.searchBy}: ${Strings.creator}, ${Strings.area}, ${Strings.cardType}, ${Strings.methodology}, ${Strings.preclassifier}, ${Strings.priority}, ${Strings.mechanic}, ${Strings.responsible}`}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: '6px' }}
                    allowClear
                  />
                </div>

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

                {/* Status Filter */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography.Text strong>{Strings.status}</Typography.Text>
                  </div>
                  <Select
                    value={selectedStatus}
                    style={{ width: '100%' }}
                    onChange={(value) => setSelectedStatus(value)}
                    options={[
                      { value: "A", label: Strings.onlyOpen },
                      { value: "P", label: Strings.onlyProvisional },
                      { value: "A,P", label: Strings.openPlusProvisional },
                      { value: "R", label: Strings.onlyResolved },
                      { value: "C", label: Strings.onlyCanceled },
                      { value: "D", label: Strings.onlyDiscarded },
                      { value: "A,P,C,R,D", label: Strings.allStatuses },
                    ]}
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
                      allowClear
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
                      allowClear
                    />
                  </div>

                  {/* Level Machine ID Filter */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <Typography.Text strong>{Strings.levelMachineId}</Typography.Text>
                    </div>
                    <Input
                      placeholder={Strings.enterMachineId}
                      value={levelMachineId}
                      onChange={(e) => setLevelMachineId(e.target.value)}
                      style={{ borderRadius: '6px' }}
                      allowClear
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Creator Filter */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <Typography.Text strong>{Strings.creator}</Typography.Text>
                    </div>
                    <Input
                      placeholder={`${Strings.filterBy} ${Strings.creator.toLowerCase()}`}
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      style={{ borderRadius: '6px' }}
                      allowClear
                    />
                  </div>

                  {/* Resolver Filter */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <Typography.Text strong>{Strings.responsible}</Typography.Text>
                    </div>
                    <Input
                      placeholder={`${Strings.filterBy} ${Strings.responsible.toLowerCase()}`}
                      value={resolver}
                      onChange={(e) => setResolver(e.target.value)}
                      style={{ borderRadius: '6px' }}
                      allowClear
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
                        onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                        placeholder={[Strings.startDate, Strings.endDate]}
                      />
                    </div>
                  </div>
                </div>
              </Space>
            </Card>
          </Card>

          {/* Tag list with traditional pagination */}
          <List
            grid={RESPONSIVE_LIST}
            dataSource={data}
            loading={isLoading}
            pagination={total > 0 ? {
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              pageSizeOptions: Constants.PAGE_SIZE_OPTIONS,
              onChange: handlePageChange,
              onShowSizeChange: (size) => handlePageChange(1, size),
              showTotal: (total) => `${Strings.total || "Total"} ${total} ${Strings.cards || "cards"}`,
            } : false}
            className="mt-10"
            renderItem={(item: CardInterface) => (
              <List.Item>
                <TagCard data={item} />
              </List.Item>
            )}
          />

          {/* Create Card Modal */}
          <CreateCardModal
            open={showCreateModal}
            onClose={handleCloseCreateModal}
            siteId={location.state?.siteId?.toString() || ""}
            siteName={siteName}
            onSuccess={handleCardCreated}
          />
        </>
      }
    />
  );
};

export default TagsPageOptimized;
