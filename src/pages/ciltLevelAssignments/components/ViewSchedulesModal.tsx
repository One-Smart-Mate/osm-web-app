import React from "react";
import { Modal, Table, Button, Empty } from "antd";
import { useGetSchedulesBySequenceQuery } from "../../../services/cilt/ciltSecuencesScheduleService";
import Strings from "../../../utils/localizations/Strings";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface ViewSchedulesModalProps {
  visible: boolean;
  onCancel: () => void;
  sequenceId: number;
  sequenceName: string;
  zIndex?: number;
}

const ViewSchedulesModal: React.FC<ViewSchedulesModalProps> = ({
  visible,
  onCancel,
  sequenceId,
  sequenceName,
  zIndex = 1000,
}) => {
  const { data: schedules, isLoading, error } = useGetSchedulesBySequenceQuery(
    sequenceId,
    { skip: !visible || !sequenceId }
  );

  // Function to convert UTC time to local time for display
  const convertUTCTimeToLocal = (utcTime: string): string => {
    if (!utcTime) return '';
    
    // Get user's timezone
    const userTimezone = dayjs.tz.guess();
    
    // Create a UTC datetime with today's date and the UTC time
    const utcDateTime = dayjs().utc().hour(parseInt(utcTime.split(':')[0])).minute(parseInt(utcTime.split(':')[1])).second(parseInt(utcTime.split(':')[2] || '0'));
    
    // Convert to local timezone
    const localDateTime = utcDateTime.tz(userTimezone);
    
    // Return formatted time
    return localDateTime.format("HH:mm");
  };

  // Helper function to format schedule type
  const getScheduleTypeDescription = (scheduleType: string) => {
    switch (scheduleType) {
      case 'dai':
        return Strings.daily;
      case 'wee':
        return Strings.weekly;
      case 'mon':
        return Strings.monthly;
      case 'yea':
        return Strings.yearly;
      case 'man':
        return Strings.manually;
      default:
        return scheduleType;
    }
  };

  // Helper function to get day names
  const getDayNames = (schedule: any) => {
    const days = [];
    if (schedule.mon === 1) days.push(Strings.monday);
    if (schedule.tue === 1) days.push(Strings.tuesday);
    if (schedule.wed === 1) days.push(Strings.wednesday);
    if (schedule.thu === 1) days.push(Strings.thursday);
    if (schedule.fri === 1) days.push(Strings.friday);
    if (schedule.sat === 1) days.push(Strings.saturday);
    if (schedule.sun === 1) days.push(Strings.sunday);
    return days.length > 0 ? days.join(', ') : Strings.noOne;
  };

  // Helper function to get a human-readable description of the schedule
  const getScheduleDescription = (schedule: any) => {
    const time = schedule.schedule ? convertUTCTimeToLocal(schedule.schedule) : '';
    const endDate = schedule.endDate ? ` ${Strings.until} ${schedule.endDate.substring(0, 10)}` : '';
    
    switch (schedule.scheduleType) {
      case 'dai':
        return `${Strings.everyDayAt} ${time}${endDate}`;
      case 'wee':
        return `${getDayNames(schedule)} ${Strings.atHour} ${time}${endDate}`;
      case 'mon':
        if (schedule.dayOfMonth) {
          return `${Strings.theDay} ${schedule.dayOfMonth} ${Strings.ofEachMonth} ${Strings.atHour} ${time}${endDate}`;
        } else if (schedule.weekOfMonth) {
          const weekNames = [Strings.firstWeek, Strings.secondWeek, Strings.thirdWeek, Strings.fourthWeek, Strings.fifthWeek];
          const week = weekNames[schedule.weekOfMonth - 1] || schedule.weekOfMonth;
          const days = getDayNames(schedule);
          return `${week} ${Strings.weekOfMonth} ${Strings.ofEachMonth}: ${days} ${Strings.atHour} ${time}${endDate}`;
        }
        return `${Strings.monthly} ${Strings.atHour} ${time}${endDate}`;
      case 'yea':
        if (schedule.dateOfYear) {
          return `${Strings.theDay} ${schedule.dateOfYear.substring(5, 10)} ${Strings.ofEachYear} ${Strings.atHour} ${time}${endDate}`;
        } else if (schedule.monthOfYear) {
          const monthNames = [Strings.january, Strings.february, Strings.march, Strings.april, Strings.may, Strings.june, Strings.july, Strings.august, Strings.september, Strings.october, Strings.november, Strings.december];
          const month = monthNames[schedule.monthOfYear - 1] || schedule.monthOfYear;
          if (schedule.dayOfMonth) {
            return `${Strings.theDay} ${schedule.dayOfMonth} ${Strings.of} ${month} ${Strings.ofEachYear} ${Strings.atHour} ${time}${endDate}`;
          } else if (schedule.weekOfMonth) {
            const weekNames = [Strings.firstWeek, Strings.secondWeek, Strings.thirdWeek, Strings.fourthWeek, Strings.fifthWeek];
            const week = weekNames[schedule.weekOfMonth - 1] || schedule.weekOfMonth;
            const days = getDayNames(schedule);
            return `${week} ${Strings.weekOfMonth} ${Strings.of} ${month}: ${days} ${Strings.atHour} ${time}${endDate}`;
          }
        }
        return `${Strings.yearly} ${Strings.atHour} ${time}${endDate}`;
      case 'man':
        return `${Strings.manually}`;
      default:
        return `${Strings.unknownSchedule}`;
    }
  };

  // Helper function to extract time for sorting
  const getTimeForSorting = (schedule: any) => {
    if (!schedule.schedule) return '';
    // Convert UTC time to local time for sorting
    const localTime = convertUTCTimeToLocal(schedule.schedule);
    return localTime;
  };

  // Define columns for the table
  const tableColumns = [
    {
      title: Strings.type,
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      render: (text: string) => getScheduleTypeDescription(text),
      sorter: (a: any, b: any) => getScheduleTypeDescription(a.scheduleType).localeCompare(getScheduleTypeDescription(b.scheduleType)),
    },
    {
      title: Strings.hour,
      dataIndex: 'schedule',
      key: 'schedule',
      render: (text: string) => text ? convertUTCTimeToLocal(text) : '-',
      sorter: (a: any, b: any) => {
        const timeA = getTimeForSorting(a);
        const timeB = getTimeForSorting(b);
        if (!timeA && !timeB) return 0;
        if (!timeA) return 1;
        if (!timeB) return -1;
        return timeA.localeCompare(timeB);
      },
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: Strings.description,
      key: 'description',
      render: (record: any) => <div style={{ whiteSpace: 'pre-wrap' }}>{getScheduleDescription(record)}</div>,
    },
  ];

  return (
    <Modal
      title={<div style={{ whiteSpace: 'pre-wrap', paddingRight: '24px' }}>{`${Strings.schedulesSecuence}: ${sequenceName}`}</div>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          {Strings.close}
        </Button>,
      ]}
      width={800}
      zIndex={zIndex}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          {Strings.loadingSecuenceSchedule}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          {Strings.errorLoadingSecuenceSchedule}
        </div>
      ) : schedules && schedules.length > 0 ? (
        <Table
          dataSource={schedules}
          columns={tableColumns}
          rowKey="id"
          pagination={false}
        />
      ) : (
        <Empty description={Strings.noSchedulesFound} />
      )}
    </Modal>
  );
};

export default ViewSchedulesModal;
