import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useGetDiscardedCardsByUserQuery, useGetCardsMutation } from '../../../services/cardService';
import { useEffect, useState, useMemo } from 'react';
import { Empty, Spin } from 'antd';
import DrawerTagList from '../../components/DrawerTagList';
import Strings from '../../../utils/localizations/Strings';
import useDarkMode from '../../../utils/hooks/useDarkMode';
import Constants from '../../../utils/Constants';

interface DiscardedCardData {
  creatorName: string;
  discardReason: string;
  cardTypeName: string;
  totalCards: string;
}

interface ChartData {
  user: string;
  totalCards: number;
  [key: string]: string | number; // Dynamic keys for each discard reason
}

interface DiscardedCardsChartProps {
  siteId: string;
  startDate?: string;
  endDate?: string;
  cardTypeName?: string | null;
}

const DiscardedCardsChart: React.FC<DiscardedCardsChartProps> = ({
  siteId,
  startDate,
  endDate,
  cardTypeName
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [discardReasons, setDiscardReasons] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState(Strings.empty);
  const [selectedReason, setSelectedReason] = useState(Strings.empty);
  const [allCards, setAllCards] = useState<any[]>([]);

  // Convert siteId to number for the API call
  const siteIdNumber = parseInt(siteId, 10);

  const { data: discardedData, error, isLoading } = useGetDiscardedCardsByUserQuery({
    siteId: siteIdNumber,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  });

  // Get all cards for the drawer functionality
  const [getCards, { data: allCardsData, isLoading: isLoadingAllCards }] = useGetCardsMutation();

  // Filter all cards to show only discarded cards matching the selection
  const filteredSearchData = useMemo(() => {
    if (!allCards || allCards.length === 0) {
      return [];
    }
    
    const filtered = allCards.filter(card => {
      // Check if card is discarded by status - be more permissive
      const isDiscarded = card.status === Constants.STATUS_DISCARDED || 
                         card.status === Constants.STATUS_DISCARDED || 
                         card.status === Constants.STATUS_CANCELLED_CARD ||
                         card.status === Constants.STATUS_CANCELED ||
                         card.status === Constants.STATUS_CANCELLED_CARD ||
                         card.status?.toLowerCase().includes('discard') ||
                         card.status?.toLowerCase().includes('cancel');
      
      if (!isDiscarded) return false;
      
      // Filter by selected user - check creatorName, responsableName and mechanicName
      if (selectedUser !== Strings.empty) {
        const userMatches = card.creatorName === selectedUser ||
                           card.responsableName === selectedUser || 
                           card.mechanicName === selectedUser;
        if (!userMatches) return false;
      }
      
      // Filter by card type if specified
      if (cardTypeName && card.cardTypeName !== cardTypeName) return false;
      
      return true;
    });
    
    return filtered;
  }, [allCards, selectedUser, selectedReason, cardTypeName]);

  // Color palette for different discard reasons
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
    '#BB8FCE', // Light Purple
    '#85C1E9'  // Light Blue
  ];

  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  useEffect(() => {
    if (discardedData && discardedData.length > 0) {
      processChartData(discardedData);
    } else {
      setChartData([]);
      setDiscardReasons([]);
    }
  }, [discardedData, cardTypeName]);

  // Load all cards when component mounts
  useEffect(() => {
    const loadAllCards = async () => {
      try {
        const cards = await getCards(siteId).unwrap();
        setAllCards(cards || []);
      } catch (error) {
        setAllCards([]);
      }
    };

    loadAllCards();
  }, [siteId, getCards]);

  // Update allCards when new data is fetched
  useEffect(() => {
    if (allCardsData) {
      setAllCards(allCardsData);
    }
  }, [allCardsData]);

  const processChartData = (data: DiscardedCardData[]) => {
    // Filter by cardTypeName if provided
    let filteredData = data;
    if (cardTypeName) {
      filteredData = data.filter(item => item.cardTypeName === cardTypeName);
    }

    // Get unique users and discard reasons
    const users = [...new Set(filteredData.map(item => item.creatorName))];
    const reasons = [...new Set(filteredData.map(item => item.discardReason))];
    
    setDiscardReasons(reasons);

    // Create chart data structure
    const processedData: ChartData[] = users.map(user => {
      const userEntry: ChartData = { user, totalCards: 0 };
      
      // Initialize all reasons with 0
      reasons.forEach(reason => {
        userEntry[reason] = 0;
      });

      // Fill with actual data
      let userTotal = 0;
      filteredData
        .filter(item => item.creatorName === user)
        .forEach(item => {
          const count = parseInt(item.totalCards) || 0;
          userEntry[item.discardReason] = count;
          userTotal += count;
        });

      userEntry.totalCards = userTotal;
      return userEntry;
    });

    // Sort by total cards descending
    const sortedData = processedData.sort((a, b) => b.totalCards - a.totalCards);
    setChartData(sortedData);
  };

  const handleOnClick = (data: any, reason?: string) => {
    const reasonToUse = reason || 'all';
    
    setSelectedUser(data.user);
    setSelectedReason(reasonToUse !== 'all' ? reasonToUse : Strings.discardedCardsAllReasons);
    setOpen(true);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      const total = data?.totalCards || 0;
      
      return (
        <div 
          className={`py-2 px-4 rounded-md shadow-lg ${textClass}`} 
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <p className="font-medium">{`${Strings.discardedCardsUser}: ${label}`}</p>
          <p>{`${Strings.total}: ${total} ${Strings.discardedCardsCards}`}</p>
          <div className="mt-2">
            <p className="font-medium">{Strings.discardedCardsBreakdownByReason}:</p>
            {payload.map((entry: any, index: number) => (
              entry.value > 0 && (
                <div key={index} className="flex items-center gap-2 ml-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{`${entry.dataKey}: ${entry.value}`}</span>
                </div>
              )
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <div className="flex justify-center flex-wrap gap-2 mb-2">
      {discardReasons.map((reason, index) => (
        <div key={index} className="flex gap-1 items-center">
          <div
            className="w-4 h-4 rounded-lg border border-black"
            style={{
              background: colors[index % colors.length],
            }}
          />
          <h1 className="md:text-sm text-xs">
            {reason}
          </h1>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p>{Strings.discardedCardsErrorLoading}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={Strings.discardedCardsNoData} />;
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 50,
          }}
        >
          <Legend content={<CustomLegend />} verticalAlign="top" />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="user" 
            angle={-15}
            textAnchor="end"
            className="md:text-sm text-xs"
          />
          <YAxis 
            tickFormatter={(value: any) => Math.round(Number(value)).toString()}
            allowDecimals={false}
            domain={[0, 'dataMax']}
            tickCount={5}
            scale="linear"
            label={{ value: Strings.cards, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={false}
            isAnimationActive={false}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ 
              zIndex: 9999, 
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
            }}
          />
          {discardReasons.map((reason, index) => (
            <Bar
              key={reason}
              dataKey={reason}
              stackId="discarded"
              fill={colors[index % colors.length]}
              stroke="black"
              strokeWidth={0.5}
              onClick={(data) => handleOnClick(data, reason)}
            >
              {chartData.map((_, dataIndex) => (
                <Cell
                  key={`cell-${reason}-${dataIndex}`}
                  className="transform transition-transform duration-200 hover:opacity-70 cursor-pointer"
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <DrawerTagList
        open={open}
        dataSource={filteredSearchData}
        isLoading={isLoadingAllCards}
        label={Strings.discardedCardsUser}
        onClose={() => setOpen(false)}
        totalCards={filteredSearchData.length.toString()}
        text={selectedUser}
        cardTypeName={selectedReason}
      />
    </>
  );
};

export default DiscardedCardsChart; 