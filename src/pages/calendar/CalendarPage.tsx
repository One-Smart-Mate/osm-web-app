import React from 'react';
import { useLocation } from 'react-router-dom';
import { Typography } from 'antd';
import CalendarChart from './CalendarChart';
import Strings from '../../utils/localizations/Strings';

const { Title } = Typography;

const CalendarPage: React.FC = () => {
  const location = useLocation();
  const siteId = location.state?.siteId;
  const siteName = location.state?.siteName;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        {Strings.calendarTitle}
      </Title>

      <CalendarChart
        siteId={siteId}
        siteName={siteName}
      />
    </div>
  );
};

export default CalendarPage;