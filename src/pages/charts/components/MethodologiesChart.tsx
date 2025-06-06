import { useState } from "react";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";
import Strings from "../../../utils/localizations/Strings";
import {
  Cell,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import useDarkMode from "../../../utils/hooks/useDarkMode";
import { Methodology } from "../../../data/charts/charts";
import { CardTypesCatalog } from "../../../data/cardtypes/cardTypes";

export interface MethodologiesChartProps {
  siteId: string; 
  methodologies: Methodology[];
  methodologiesCatalog: CardTypesCatalog[];
}

const MethodologiesChart = ({ siteId, methodologies }: MethodologiesChartProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    cardTypeName: string;
  } | null>(null);
  
  // Use dark mode hook to determine text color
  const isDarkMode = useDarkMode();
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  
  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  
  const handleOnClick = (data: any) => {
    const cardTypeName = data.payload.methodology;
    const params = { siteId, cardTypeName };
    setSearchParams(params);
    setSelectedTotalCards(data.payload.totalCards);
    setCardTypeName(cardTypeName);
    setOpen(true);
  };
  
  
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: PieLabelRenderProps | any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const text = `${(percent * 100).toFixed(1)}%`;
    const textWidth = text.length * 9;
    const textHeight = 18;

    return (
      <g>
        <rect
          x={x - textWidth / 2}
          y={y - textHeight / 2}
          width={textWidth}
          height={textHeight}
          fill="rgba(0, 0, 0, 0.75)"
          rx={5}
          ry={5}
        />
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            stroke="black"
            dataKey="totalCards"
            data={methodologies}
            cx="50%"
            cy="45%"
            outerRadius={100}
            labelLine={false}
            label={renderCustomizedLabel}
            onClick={handleOnClick} 
          >
            {methodologies.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`#${entry.color}`} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }: TooltipProps<number, string>) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                if (!item) return null;
                
                const methodology = item.payload.methodology;
                const totalCards = item.payload.totalCards;
                const color = item.payload.color;
                
                return (
                  <div 
                    className={`py-2 px-4 rounded-md shadow-lg ${textClass}`} 
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(2px)',
                      zIndex: 9999
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: `#${color}` }}
                      />
                      <p className="font-medium">{methodology}</p>
                    </div>
                    <p>{Strings.totalCards}: {totalCards}</p>
                  </div>
                );
              }
              return null;
            }}
            cursor={false}
            isAnimationActive={false}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ 
              zIndex: 9999, 
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <DrawerTagList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        label={Strings.cardType} 
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        text={selectedCardTypeName}
        cardTypeName={selectedCardTypeName} />
    </>
  );
};

export default MethodologiesChart;
