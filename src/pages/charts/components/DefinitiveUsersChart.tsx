import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Methodology } from "../../../data/charts/charts";
import { useGetDefinitiveUsersChartDataMutation } from "../../../services/chartService";
import Strings from "../../../utils/localizations/Strings";
import CustomLegend from "../../../components/CustomLegend";
import { useSearchCardsQuery } from "../../../services/cardService";
import { UserRoles } from "../../../utils/Extensions";
import CustomDrawerCardList from "../../../components/CustomDrawerCardList";

export interface ChartProps {
  siteId: string;
  startDate: string;
  endDate: string;
  rol: UserRoles;
  methodologies: Methodology[];
}

const DefinitiveUsersChart = ({
  siteId,
  startDate,
  endDate,
  methodologies,
  rol,
}: ChartProps) => {
  const [getDefinitiveUsers] = useGetDefinitiveUsersChartDataMutation();
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedDefinitiveUserName, setSelectedDefinitveUserName] = useState(
    Strings.empty
  );
  const [selectedCardTypeName, setCardTypeName] = useState(Strings.empty);
  const [selectedTotalCards, setSelectedTotalCards] = useState(Strings.empty);
  const [searchParams, setSearchParams] = useState<{
    siteId: string;
    definitiveUser?: string;
    cardTypeName: string;
  } | null>(null);

  const { data: searchData, isFetching } = useSearchCardsQuery(searchParams, {
    skip: !searchParams,
  });

  const handleGetData = async () => {
    const response = await getDefinitiveUsers({
      siteId,
      startDate,
      endDate,
    }).unwrap();
    const definitiveUserMap: { [key: string]: any } = {};
    response.forEach((item: any) => {
      if (!definitiveUserMap[item.definitiveUser]) {
        definitiveUserMap[item.definitiveUser] = {
          definitiveUser: item.definitiveUser || Strings.noDefinitiveUser,
        };
      }
      definitiveUserMap[item.definitiveUser][item.cardTypeName.toLowerCase()] =
        parseInt(item.totalCards, 10);
    });
    const transformedData = Object.values(definitiveUserMap);
    setTransformedData(transformedData);
  };

  useEffect(() => {
    handleGetData();
  }, [startDate, endDate]);

  const handleOnClick = (data: any, cardTypeName: string) => {
    setSearchParams({
      siteId,
      definitiveUser:
        data.definitiveUser !== Strings.noDefinitiveUser
          ? data.definitiveUser
          : Strings.none,
      cardTypeName: cardTypeName,
    });
    const normalizedCardTypeName = cardTypeName.toLowerCase();
    setSelectedTotalCards(data[normalizedCardTypeName]);
    setSelectedDefinitveUserName(
      data.definitiveUser !== Strings.noDefinitiveUser
        ? data.definitiveUser
        : Strings.none
    );
    setCardTypeName(cardTypeName);
    setOpen(true);
  };

  return (
    <>
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart data={transformedData} margin={{ bottom: 50 }}>
          <Legend content={<CustomLegend />} verticalAlign="top" />
          <CartesianGrid strokeDasharray="3 3" />
          <YAxis />
          <XAxis
            dataKey={"definitiveUser"}
            angle={-15}
            textAnchor="end"
            className="md:text-sm text-xs"
          />
          {methodologies.map((m) => (
            <Bar
              key={m.methodology}
              dataKey={`${m.methodology.toLowerCase()}`}
              stackId="a"
              stroke="black"
              fill={`#${m.color}`}
              onClick={(data) => handleOnClick(data, m.methodology)}
            >
              {transformedData.map((_, index) => (
                <Cell
                  key={`cell-${m.methodology}-${index}`}
                  className="transform transition-transform duration-200  hover:opacity-70 cursor-pointer"
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <CustomDrawerCardList
        open={open}
        dataSource={searchData}
        isLoading={isFetching}
        label={Strings.definitiveUser}
        onClose={() => setOpen(false)}
        totalCards={selectedTotalCards}
        rol={rol}
        text={selectedDefinitiveUserName}
        cardTypeName={selectedCardTypeName}
      />
    </>
  );
};
export default DefinitiveUsersChart;
