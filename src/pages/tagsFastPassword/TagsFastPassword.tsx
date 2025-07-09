import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, Input, Button, Typography, Space, Card, Empty, Select, DatePicker, Divider, TimeRangePickerProps } from "antd";
import { KeyOutlined, FilterOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { BsSortDown, BsCalendarRange } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../core/store";
import { selectIsSessionLocked, setSessionLocked } from "../../core/genericReducer";
import { useFindCardsByFastPasswordQuery } from "../../services/cardService";
import { CardInterface } from "../../data/card/card";
import { useDebounce } from "use-debounce";
import dayjs, { Dayjs } from "dayjs";
import MainContainer from "../layouts/MainContainer";
import TagList from "../components/TagList";
import Strings from "../../utils/localizations/Strings";
import { handleErrorNotification } from "../../utils/Notifications";
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

const TagsFastPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSessionLocked = useAppSelector(selectIsSessionLocked);
  
  // Fast password modal state
  const [modalVisible, setModalVisible] = useState(true);
  const [fastPassword, setFastPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Card data state
  const [cardsData, setCardsData] = useState<CardInterface[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter states (same as TagsPage)
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("");
  const [cardNumber, setCardNumber] = useState("");
  const [debouncedCardNumber] = useDebounce(cardNumber, 300);
  const [location_, setLocation] = useState("");
  const [debouncedLocation] = useDebounce(location_, 300);
  const [creator, setCreator] = useState("");
  const [debouncedCreator] = useDebounce(creator, 300);
  const [resolver, setResolver] = useState("");
  const [debouncedResolver] = useDebounce(resolver, 300);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("");
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  
  const siteName = location?.state?.siteName || "Fast Password Search";
  const siteId = location?.state?.siteId;

  // RTK Query hook for fetching cards by fast password
  const {
    data: fastPasswordResponse,
    error: fastPasswordError,
    isFetching: isFetchingCards
  } = useFindCardsByFastPasswordQuery(
    { siteId: siteId!, fastPassword },
    { 
      skip: !siteId || !fastPassword || !hasSearched,
      refetchOnMountOrArgChange: true
    }
  );

  // Effect to handle the response
  useEffect(() => {
    if (fastPasswordResponse && hasSearched) {
      setCardsData(fastPasswordResponse.cards || []);
      setIsLoading(false);
    }
  }, [fastPasswordResponse, hasSearched]);

  // Effect to handle errors
  useEffect(() => {
    if (fastPasswordError && hasSearched) {
      handleErrorNotification(fastPasswordError);
      setIsLoading(false);
    }
  }, [fastPasswordError, hasSearched]);

  // Redirect if not in locked session
  useEffect(() => {
    if (!isSessionLocked) {
      // If session is not locked, redirect back to regular cards page
      navigate(`/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cards}`, {
        state: location.state
      });
    }
  }, [isSessionLocked, navigate, location.state]);

  const handleFastPasswordSubmit = async () => {
    if (!fastPassword.trim()) {
      return;
    }

    if (!siteId) {
      handleErrorNotification({
        data: { message: "No site ID available. Please try again." }
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    // Unlock session and redirect back
    dispatch(setSessionLocked(false));
    navigate(`/${Constants.ROUTES_PATH.dashboard}/${Constants.ROUTES_PATH.cards}`, {
      state: location.state
    });
  };

  const handleNewSearch = () => {
    setFastPassword("");
    setCardsData([]);
    setHasSearched(false);
    setModalVisible(true);
    // Clear all filters
    setCardNumber("");
    setLocation("");
    setCreator("");
    setResolver("");
    setSearchText("");
    setDateFilterType("");
    setDateRange(null);
    setSortOption("");
  };

  // Filter functions (same as TagsPage)
  const search = useCallback((item: CardInterface, query: string) => {
    const normalizedQuery = query.toLowerCase();
    return (
      item.creatorName.toLowerCase().includes(normalizedQuery) ||
      item.areaName.toLowerCase().includes(normalizedQuery) ||
      item.cardTypeMethodologyName.toLowerCase().includes(normalizedQuery) ||
      item.cardTypeName.toLowerCase().includes(normalizedQuery) ||
      item.preclassifierDescription.toLowerCase().includes(normalizedQuery) ||
      item.priorityDescription.toLowerCase().includes(normalizedQuery) ||
      item.mechanicName?.toLowerCase().includes(normalizedQuery) ||
      item.responsableName?.toLowerCase().includes(normalizedQuery) ||
      item.userProvisionalSolutionName?.toLowerCase().includes(normalizedQuery) ||
      item.userDefinitiveSolutionName?.toLowerCase().includes(normalizedQuery)
    );
  }, []);

  const filterByCardNumber = useCallback((item: CardInterface, cardNum: string) => {
    if (!cardNum) return true;
    return item.siteCardId.toString().includes(cardNum);
  }, []);

  const filterByLocation = useCallback((item: CardInterface, loc: string) => {
    if (!loc) return true;
    const normalizedLocation = loc.toLowerCase();
    return item.cardLocation.toLowerCase().includes(normalizedLocation);
  }, []);

  const filterByCreator = useCallback((item: CardInterface, creatorQuery: string) => {
    if (!creatorQuery) return true;
    const normalizedCreator = creatorQuery.toLowerCase();
    return item.creatorName.toLowerCase().includes(normalizedCreator);
  }, []);

  const filterByResolver = useCallback((item: CardInterface, resolverQuery: string) => {
    if (!resolverQuery) return true;
    const normalizedResolver = resolverQuery.toLowerCase();
    return (
      item.responsableName?.toLowerCase().includes(normalizedResolver) ||
      item.userProvisionalSolutionName?.toLowerCase().includes(normalizedResolver) ||
      item.userDefinitiveSolutionName?.toLowerCase().includes(normalizedResolver)
    );
  }, []);

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

  // Filtered data (same logic as TagsPage)
  const filteredData = useMemo(() => {
    if (!cardsData || !cardsData.length) return [];

    let filteredResults = cardsData;

    if (debouncedSearchText) {
      filteredResults = filteredResults.filter(item => search(item, debouncedSearchText));
    }

    if (debouncedCardNumber) {
      filteredResults = filteredResults.filter(item => filterByCardNumber(item, debouncedCardNumber));
    }

    if (debouncedLocation) {
      filteredResults = filteredResults.filter(item => filterByLocation(item, debouncedLocation));
    }

    if (debouncedCreator) {
      filteredResults = filteredResults.filter(item => filterByCreator(item, debouncedCreator));
    }

    if (debouncedResolver) {
      filteredResults = filteredResults.filter(item => filterByResolver(item, debouncedResolver));
    }

    if (dateRange && dateFilterType) {
      filteredResults = filteredResults.filter(item => filterByDateRange(item, dateFilterType, dateRange));
    }

    if (sortOption) {
      filteredResults = [...filteredResults].sort((a, b) => sortCards(a, b, sortOption));
    }

    return filteredResults;
  }, [cardsData, debouncedSearchText, debouncedCardNumber, debouncedLocation, debouncedCreator, debouncedResolver, dateRange, dateFilterType, sortOption, search, filterByCardNumber, filterByLocation, filterByCreator, filterByResolver, filterByDateRange, sortCards]);

  // Sort options for dropdown
  const sortOptions = [
    { value: '', label: Strings.noSort },
    { value: 'dueDate-asc', label: `${Strings.dueDate} (${Strings.ascending})` },
    { value: 'dueDate-desc', label: `${Strings.dueDate} (${Strings.descending})` },
    { value: 'creationDate-asc', label: `${Strings.creationDate} (${Strings.ascending})` },
    { value: 'creationDate-desc', label: `${Strings.creationDate} (${Strings.descending})` },
  ];

  return (
    <>
      {/* Fast Password Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: "#1890ff" }} />
            <span>Ingrese Fast Password</span>
          </Space>
        }
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancelar
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={handleFastPasswordSubmit}
            disabled={!fastPassword.trim()}
            icon={<KeyOutlined />}
          >
            Buscar Tarjetas
          </Button>
        ]}
        width={400}
        centered
        maskClosable={false}
        closable={false}
      >
        <div style={{ marginTop: '16px' }}>
          <Typography.Text strong>
            Ingrese el Fast Password para buscar las tarjetas:
          </Typography.Text>
          <Input.Password
            placeholder="Ingrese fast password de 4 caracteres"
            value={fastPassword}
            onChange={(e) => setFastPassword(e.target.value.toUpperCase())}
            maxLength={4}
            style={{ 
              marginTop: '12px',
              fontSize: '18px',
              textAlign: 'center',
              letterSpacing: '4px'
            }}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onPressEnter={handleFastPasswordSubmit}
            autoFocus
          />
          <Typography.Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
            El fast password debe tener exactamente 4 caracteres alfabéticos.
          </Typography.Text>
        </div>
      </Modal>

      {/* Main Content - Tags Page Integration */}
      <MainContainer
        title={`Tarjetas por Fast Password${fastPassword ? ` (${fastPassword})` : ''}`}
        description={siteName}
        enableSearch={false}
        enableBackButton={true}
        isLoading={isLoading || isFetchingCards}
        content={
          <>
            {hasSearched && (
              <>
                {/* Action buttons */}
                <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button 
                    type="default" 
                    icon={<KeyOutlined />}
                    onClick={handleNewSearch}
                  >
                    Nueva Búsqueda
                  </Button>
                </div>

                {/* Filter section - same as TagsPage */}
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
                              onChange={(dates) => setDateRange(dates)}
                              placeholder={[Strings.startDate, Strings.endDate]}
                            />
                          </div>
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Card>

                {/* Results */}
                {cardsData.length === 0 && !isLoading && !isFetchingCards ? (
                  <Card>
                    <Empty 
                      description={
                        <div>
                          <Typography.Text type="secondary">
                            No se encontraron tarjetas para el fast password: <strong>{fastPassword}</strong>
                          </Typography.Text>
                          <br />
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                            Verifique que el fast password sea correcto y que tenga tarjetas asociadas.
                          </Typography.Text>
                        </div>
                      }
                      image={<KeyOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
                    />
                  </Card>
                ) : (
                  <TagList data={filteredData} isLoading={isLoading || isFetchingCards} isResponsive={true} />
                )}
              </>
            )}
          </>
        }
      />
    </>
  );
};

export default TagsFastPassword;
