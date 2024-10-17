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
} from "recharts";
import { useGetPreclassifiersChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import { useSearchCardsQuery } from "../../../services/cardService";
import CustomDrawerCardList from "../../../components/CustomDrawerCardList";
import { UserRoles } from "../../../utils/Extensions";

export interface ChartProps {
  siteId: string;
  rol: UserRoles;
}

const PreclassifiersChart = ({ siteId, rol }: ChartProps) => {
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
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleOnClick = (data: Preclassifier) => {
    setSearchParams({
      siteId,
      preclassifier: data.preclassifier,
      cardTypeName: data.methodology,
    });
    setSelectedTotalCards(String(data.totalCards));
    setPreclassifierName(data.preclassifier);
    setCardTypeName(data.methodology);
    setOpen(true);
  };

  const handleGetData = async () => {
    const response = await getAnomalies(siteId).unwrap();
    setPreclassifiers(response);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={preclassifiers} margin={{ bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis dataKey={"totalCards"} />
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
      <CustomDrawerCardList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        label={Strings.preclassifier}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        rol={rol}
        text={selectedPreclassifierName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default PreclassifiersChart;
