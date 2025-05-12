import { useState } from "react";
import { useSearchCardsQuery } from "../../../services/cardService";
import CustomDrawerCardList from "../../../components/CustomDrawerCardList";
import Strings from "../../../utils/localizations/Strings";
import {
  Cell,
  Pie,
  PieChart,
  PieLabelRenderProps,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
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
            content={({ payload }) => (
              <div>
                {payload?.map((item, index) => (
                  <div
                    className="md:text-sm text-xs w-52 md:w-auto text-white py-2 px-4 rounded-md shadow-lg"
                    key={index}
                    style={{backgroundColor: `#${item.payload.color ?? '000'}`}}
                  >
                    <p>
                      {Strings.cardName} {item.payload.methodology}
                    </p>
                    <p>
                      {Strings.totalCards} {item.payload.totalCards}
                    </p>
                  </div>
                ))}
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Componente para mostrar la lista de cards/tags */}
      <CustomDrawerCardList
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
