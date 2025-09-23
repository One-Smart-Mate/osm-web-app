import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, View, momentLocalizer, Event } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Custom CSS to fix drag width issue
const customDragStyles = `
  .rbc-addons-dnd-drag-preview {
    width: auto !important;
    max-width: 150px !important;
    opacity: 0.8 !important;
  }

  .rbc-event.rbc-event-dragging {
    opacity: 0.5 !important;
  }
`;
import { Card, Tag, Tooltip, Spin, Badge, Typography, Space, Button, Drawer, Descriptions, notification } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { CalendarCard, useGetCardsForCalendarMutation } from '../../services/chartService';
import { useUpdateCardCustomDueDateMutation } from '../../services/cardService';
import useCurrentUser from '../../utils/hooks/useCurrentUser';
import Strings from '../../utils/localizations/Strings';
import { useNavigate } from 'react-router-dom';
import { buildCardDetailRoute } from '../../routes/RoutesExtensions';
import Constants from '../../utils/Constants';
import AnatomyNotification from '../components/AnatomyNotification';
import i18n from '../../config/i18n';

// Configure moment locale based on current language
moment.locale(i18n.language === 'en' ? 'en' : 'es');

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarChartProps {
  siteId: string;
  siteName: string;
  startDate?: string;
  endDate?: string;
  selectedStatus?: string;
}

interface CalendarEvent extends Event {
  id: number;
  title?: string;
  start?: Date;
  end?: Date;
  cardData: CalendarCard;
  resource?: any;
}

const CalendarChart: React.FC<CalendarChartProps> = ({
  siteId,
  startDate,
  endDate,
  selectedStatus
}) => {
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCard, setSelectedCard] = useState<CalendarCard | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [notificationApi, contextHolder] = notification.useNotification();

  // Update moment locale when language changes
  useEffect(() => {
    const locale = i18n.language === 'en' ? 'en' : 'es';
    moment.locale(locale);
  }, [i18n.language]);

  const [getCalendarData, { isLoading }] = useGetCardsForCalendarMutation();
  const [updateCardDueDate] = useUpdateCardCustomDueDateMutation();

  // Calculate date range for API call
  const getDateRange = useCallback(() => {
    const start = startDate || moment(currentDate).startOf('month').subtract(1, 'month').format('YYYY-MM-DD');
    const end = endDate || moment(currentDate).endOf('month').add(1, 'month').format('YYYY-MM-DD');
    return { start, end };
  }, [currentDate, startDate, endDate]);

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    const { start, end } = getDateRange();
    try {
      const response = await getCalendarData({
        siteId,
        startDate: start,
        endDate: end,
        status: selectedStatus || 'A'
      }).unwrap();

      // Convert calendar data to events
      const calendarEvents: CalendarEvent[] = [];
      Object.entries(response).forEach(([date, cards]) => {
        cards.forEach((card) => {
          // Parse date properly to avoid timezone issues
          const [year, month, day] = date.split('-').map(Number);
          const eventDate = new Date(year, month - 1, day, 12, 0, 0); // Set to noon to avoid timezone issues

          calendarEvents.push({
            id: card.id,
            title: `#${card.siteCardId} - ${card.priorityCode || 'N/A'}`,
            start: eventDate,
            end: eventDate,
            cardData: card,
            resource: card
          });
        });
      });

      setEvents(calendarEvents);
    } catch (_error) {
      AnatomyNotification.error(notificationApi, Strings.errorLoadingCalendar);
    }
  }, [siteId, getDateRange, selectedStatus, getCalendarData]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Handle drag and drop - only update when user drops and reload calendar
  const moveEvent = useCallback(
    async ({ event, start }: any) => {
      // Prevent multiple updates
      if (isUpdating) {
        return;
      }

      const cardEvent = event as CalendarEvent;
      const newDate = moment(start).format('YYYY-MM-DD');
      const originalDate = moment(cardEvent.start).format('YYYY-MM-DD');

      if (newDate === originalDate) {
        return; // No change in date
      }

      // Set updating flag immediately
      setIsUpdating(true);

      try {
        await updateCardDueDate({
          cardId: cardEvent.id,
          customDueDate: newDate,
          idOfUpdatedBy: parseInt(user?.userId?.toString() || '0')
        }).unwrap();

        notificationApi.success({
          message: Strings.success,
          description: Strings.dueDateUpdatedSuccess,
          duration: 3,
        });

        // Reload calendar data after a short delay to ensure update is processed
        setTimeout(async () => {
          await fetchCalendarData();
          setIsUpdating(false);
        }, 500);

      } catch (_error) {
        notificationApi.error({
          message: Strings.error,
          description: Strings.errorUpdatingDueDate,
          duration: 3,
        });

        // Reload calendar data even on error to ensure consistency
        setTimeout(async () => {
          await fetchCalendarData();
          setIsUpdating(false);
        }, 500);
      }
    },
    [updateCardDueDate, user, fetchCalendarData, isUpdating]
  );

  // Custom event component
  const EventComponent = ({ event }: any) => {
    const calendarEvent = event as CalendarEvent;
    const card = calendarEvent.cardData;
    const isOverdue = moment(card.cardDueDate).isBefore(moment(), 'day');
    const isDueToday = moment(card.cardDueDate).isSame(moment(), 'day');
    const status = card.status;

    let statusIcon = <ClockCircleOutlined />;
    let statusColor = '#1890ff';

    if (status === Constants.STATUS_RESOLVED) {
      statusIcon = <CheckCircleOutlined />;
      statusColor = '#52c41a';
    } else if (status === Constants.STATUS_CANCELED || status === Constants.STATUS_DRAFT) {
      statusIcon = <CloseCircleOutlined />;
      statusColor = '#ff4d4f';
    } else if (isOverdue) {
      statusIcon = <ClockCircleOutlined />;
      statusColor = '#ff4d4f';
    } else if (isDueToday) {
      statusColor = '#fa8c16';
    }

    // Calculate how many events are at the same date/time for stacking
    const isWeekOrDayView = view === 'week' || view === 'day';
    const eventDate = moment(calendarEvent.start).format('YYYY-MM-DD HH:mm');
    const eventsAtSameTime = events.filter(e =>
      moment(e.start).format('YYYY-MM-DD HH:mm') === eventDate
    );
    const eventIndex = eventsAtSameTime.findIndex(e => e.id === calendarEvent.id);

    // Adjust positioning and size for overlapping events in day/week view
    let cardWidth = '100%';
    let marginLeft = '0px';
    let zIndex = 1;

    if (isWeekOrDayView && eventsAtSameTime.length > 1) {
      const stackWidth = Math.max(85 / eventsAtSameTime.length, 30); // Minimum 30% width
      cardWidth = `${stackWidth}%`;
      marginLeft = `${eventIndex * (stackWidth + 2)}%`;
      zIndex = eventIndex + 1;
    } else if (isWeekOrDayView) {
      cardWidth = '95%';
    }

    return (
      <Tooltip
        title={
          <div>
            <div><strong>{Strings.card}:</strong> #{card.siteCardId}</div>
            <div><strong>{Strings.type}:</strong> {card.cardTypeName}</div>
            <div><strong>{Strings.priority}:</strong> {card.priorityCode} - {card.priorityDescription}</div>
            <div><strong>{Strings.responsible}:</strong> {card.mechanicName || Strings.unassigned}</div>
            <div><strong>{Strings.location}:</strong> {card.nodeName}</div>
            <div><strong>{Strings.problem}:</strong> {card.preclassifierDescription}</div>
          </div>
        }
      >
        <div
          style={{
            padding: isWeekOrDayView ? '1px 3px' : '2px 4px',
            borderRadius: '4px',
            backgroundColor: statusColor + '20',
            borderLeft: `3px solid ${statusColor}`,
            cursor: 'move',
            fontSize: isWeekOrDayView ? '10px' : '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: isWeekOrDayView ? 'auto' : '100%',
            width: cardWidth,
            marginLeft: marginLeft,
            overflow: 'hidden',
            marginBottom: isWeekOrDayView ? '1px' : '0',
            minHeight: isWeekOrDayView ? '18px' : 'auto',
            position: isWeekOrDayView && eventsAtSameTime.length > 1 ? 'absolute' : 'relative',
            zIndex: zIndex,
            top: isWeekOrDayView && eventsAtSameTime.length > 1 ? '0' : 'auto',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCard(card);
            setDrawerVisible(true);
          }}
        >
          {!isWeekOrDayView && statusIcon}
          <span style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            #{card.siteCardId}
          </span>
          {card.priorityCode && !isWeekOrDayView && (
            <Tag
              color={card.cardTypeColor ? `#${card.cardTypeColor}` : 'default'}
              style={{
                fontSize: '9px',
                padding: '0 2px',
                margin: 0,
                lineHeight: '12px'
              }}
            >
              {card.priorityCode}
            </Tag>
          )}
          {card.priorityCode && isWeekOrDayView && eventsAtSameTime.length === 1 && (
            <span style={{
              fontSize: '8px',
              color: statusColor,
              fontWeight: 'bold'
            }}>
              {card.priorityCode}
            </span>
          )}
        </div>
      </Tooltip>
    );
  };

  // Custom date cell wrapper for showing count badges
  const DateCellWrapper = ({ children, value }: any) => {
    // Use startOf('day') to ensure proper date comparison
    const dateStr = moment(value).startOf('day').format('YYYY-MM-DD');
    const dayEvents = events.filter(e =>
      moment(e.start).startOf('day').format('YYYY-MM-DD') === dateStr
    );

    const overdueCount = dayEvents.filter(e => {
      const card = e.cardData;
      return card.status === 'A' && moment(card.cardDueDate).isBefore(moment(), 'day');
    }).length;

    const activeCount = dayEvents.filter(e => e.cardData.status === 'A').length;
    const resolvedCount = dayEvents.filter(e => e.cardData.status === Constants.STATUS_RESOLVED).length;

    return (
      <div style={{ position: 'relative', height: '100%' }}>
        {children}
        {view === 'month' && dayEvents.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            display: 'flex',
            gap: '2px'
          }}>
            {overdueCount > 0 && (
              <Badge count={overdueCount} style={{ backgroundColor: '#ff4d4f' }} />
            )}
            {activeCount > 0 && (
              <Badge count={activeCount} style={{ backgroundColor: '#1890ff' }} />
            )}
            {resolvedCount > 0 && (
              <Badge count={resolvedCount} style={{ backgroundColor: '#52c41a' }} />
            )}
          </div>
        )}
      </div>
    );
  };

  // Navigate to card details
  const handleViewCardDetails = () => {
    if (selectedCard) {
      navigate(buildCardDetailRoute(siteId, selectedCard.cardUUID), {
        state: {
          cardName: `#${selectedCard.siteCardId}`,
          siteId: siteId,
        }
      });
    }
  };

  const eventStyleGetter = (event: any) => {
    const calendarEvent = event as CalendarEvent;
    const card = calendarEvent.cardData;
    const isOverdue = moment(card.cardDueDate).isBefore(moment(), 'day');
    const isDueToday = moment(card.cardDueDate).isSame(moment(), 'day');

    let backgroundColor = '#1890ff';

    if (card.status === Constants.STATUS_RESOLVED) {
      backgroundColor = '#52c41a';
    } else if (card.status === Constants.STATUS_CANCELED || card.status === Constants.STATUS_DRAFT) {
      backgroundColor = '#ff4d4f';
    } else if (isOverdue) {
      backgroundColor = '#ff4d4f';
    } else if (isDueToday) {
      backgroundColor = '#fa8c16';
    }

    return {
      style: {
        backgroundColor: backgroundColor + '20',
        borderColor: backgroundColor,
        color: '#000'
      }
    };
  };

  return (
    <>
      {/* Inject custom styles for drag behavior */}
      <style>{customDragStyles}</style>
      {contextHolder}
      <Card
      title={
        <Space>
          <CalendarOutlined />
          <span>{Strings.calendarOfDueDates}</span>
        </Space>
      }
      extra={
        <Space>
          <Tag color="red">{Strings.overdueCards}</Tag>
          <Tag color="orange">{Strings.todayCards}</Tag>
          <Tag color="blue">{Strings.activeCards}</Tag>
          <Tag color="green">{Strings.resolvedCards}</Tag>
        </Space>
      }
      style={{ height: '100%' }}
      bodyStyle={{ height: 'calc(100% - 60px)', padding: '16px' }}
    >
      <Spin spinning={isLoading || isUpdating}>
        <DnDCalendar
          localizer={localizer}
          culture={i18n.language === 'en' ? 'en' : 'es'}
          events={events}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          style={{ height: '600px' }}
          onEventDrop={moveEvent}
          onEventResize={moveEvent}
          draggableAccessor={() => !isUpdating}
          resizable={false}
          views={['month', 'week', 'agenda']}
          components={{
            event: EventComponent,
            dateCellWrapper: DateCellWrapper
          }}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: Strings.next,
            previous: Strings.previous,
            today: Strings.today,
            month: Strings.month,
            week: Strings.week,
            day: Strings.day,
            agenda: Strings.agenda,
            date: Strings.date,
            time: Strings.time,
            event: Strings.event,
            noEventsInRange: Strings.noCardsInDateRange,
            showMore: (total: number) => `+ ${total} ${Strings.showMore}`
          }}
        />
      </Spin>

      <Drawer
        title={selectedCard ? `${Strings.card} #${selectedCard.siteCardId}` : Strings.cardDetails}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
        extra={
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={handleViewCardDetails}
          >
            {Strings.viewFullDetails}
          </Button>
        }
      >
        {selectedCard && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={Strings.card}>
              #{selectedCard.siteCardId}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.type}>
              <Tag color={selectedCard.cardTypeColor ? `#${selectedCard.cardTypeColor}` : 'default'}>
                {selectedCard.cardTypeName}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={Strings.priority}>
              {selectedCard.priorityCode} - {selectedCard.priorityDescription}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.dueDate}>
              <Typography.Text type={moment(selectedCard.cardDueDate).isBefore(moment(), 'day') ? 'danger' : undefined}>
                {moment(selectedCard.cardDueDate).format('DD/MM/YYYY')}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={Strings.creationDate}>
              {moment(selectedCard.cardCreationDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.responsible}>
              {selectedCard.mechanicName || Strings.unassigned}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.location}>
              {selectedCard.nodeName}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.problem}>
              {selectedCard.preclassifierDescription}
            </Descriptions.Item>
            <Descriptions.Item label={Strings.status}>
              {selectedCard.status === 'A' ? Strings.active :
               selectedCard.status === Constants.STATUS_RESOLVED ? Strings.resolved :
               selectedCard.status === Constants.STATUS_CANCELED ? Strings.canceled :
               selectedCard.status === Constants.STATUS_DRAFT ? Strings.discarded : Strings.unknown}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </Card>
    </>
  );
};

export default CalendarChart;