import { useEffect, useState } from "react";

import { Preclassifier } from "../../../data/charts/charts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from "recharts";
import { useGetPreclassifiersChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import { useSearchCardsQuery } from "../../../services/cardService";
import DrawerTagList from "../../components/DrawerTagList";
import useDarkMode from "../../../utils/hooks/useDarkMode";

export interface PreclassifiersChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  cardTypeName?: string | null;
  status?: string;
}

const PreclassifiersChart = ({
  siteId,
  startDate,
  endDate,
  cardTypeName,
  status
}: PreclassifiersChartProps) => {
  const isDarkMode = useDarkMode();
  const [getAnomalies] = useGetPreclassifiersChartDataMutation();
  const [preclassifiers, setPreclassifiers] = useState<Preclassifier[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPreclassifierName, setPreclassifierName] = useState(
    Strings.empty
  );
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    preclassifier?: string;
    cardTypeName: string;
    status?: string;
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleOnClick = (data: Preclassifier) => {
    setSearchParams({
      siteId,
      preclassifier: data.preclassifier,
      cardTypeName: data.methodology,
      status,
    });
    setSelectedTotalCards(String(data.totalCards));
    setPreclassifierName(data.preclassifier);
    setCardTypeName(data.methodology);
    setOpen(true);
  };

  const handleGetData = async () => {
    try {
      // Solo enviamos los parámetros básicos a la API
      const response = await getAnomalies({
        siteId,
        startDate,
        endDate,
        status,
      }).unwrap();
      
      // Filtrar los datos en el frontend si se ha seleccionado un tipo de tarjeta
      let filteredData = response;
      if (cardTypeName) {
        filteredData = response.filter(item => 
          item.methodology && item.methodology.toLowerCase() === cardTypeName.toLowerCase()
        );
      }
  
      // Ordenar después de filtrar
      const sortedData = [...filteredData].sort(
        (a: Preclassifier, b: Preclassifier) => b.totalCards - a.totalCards
      );
    
      setPreclassifiers(sortedData);
      
      // Log para depuración
      console.log('PreclassifiersChart - Filtered data:', { 
        cardTypeFilter: cardTypeName, 
        totalItems: filteredData.length 
      });
    } catch (error) {
      console.error('Error fetching preclassifiers data:', error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [startDate, endDate, cardTypeName, status]);

  // Define text color class based on dark mode
  const textClass = isDarkMode ? 'text-white' : 'text-black';

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, coordinate }: TooltipProps<number, string> & { coordinate?: { x: number, y: number } }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as Preclassifier;
      return (
        <div 
          className={`py-2 px-4 rounded-md shadow-lg ${textClass}`} 
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            transform: coordinate && coordinate.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
          }}>
          <p className="font-medium">{data.preclassifier}</p>
          <p>{Strings.methodology}: {data.methodology}</p>
          <p>{Strings.totalCards}: {data.totalCards}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={preclassifiers} margin={{ bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={false}
            // Only show tooltip when hovering directly over the bar
            isAnimationActive={false}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ 
              zIndex: 9999, 
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
            }}
            // Position adjustment is now handled in the CustomTooltip component
            // to prevent overflow at screen edges
          />
          <YAxis 
            dataKey={"totalCards"} 
            // Force integer values and prevent duplicates
            tickFormatter={(value: any) => Math.round(Number(value)).toString()}
            allowDecimals={false}
            // Set domain to use more vertical space
            domain={[0, 'dataMax']}
            tickCount={5}
            scale="linear"
            label={{ value: Strings.cards, angle: -90, position: 'insideLeft' }}
          />
          <XAxis
            dataKey={"preclassifier"}
            angle={-20}
            textAnchor="end"
            className="md:text-sm text-xs"
          />
          <Bar
            onClick={(data) => handleOnClick(data)}
            stroke="black"
            dataKey="totalCards"
          >
            {preclassifiers.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`#${entry.color}`}
                className="transform transition-transform duration-200  hover:opacity-70 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <DrawerTagList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        label={Strings.preclassifier}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        text={selectedPreclassifierName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default PreclassifiersChart;
