import {
  Area,
  Creator,
  DefinitiveUser,
  Machine,
  Mechanic,
  Preclassifier,
  Weeks,
} from "../data/charts/charts";
import { apiSlice } from "./apiSlice";

export const chartService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPreclassifiersChartData: builder.mutation<
      Preclassifier[],
      { siteId: string; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        let url = `/card/site/preclassifiers/${siteId}`;
        if (startDate || endDate) {
          url += `?${startDate ? `startDate=${startDate}&` : ""}${
            endDate ? `endDate=${endDate}` : ""
          }`;
        }
        return url;
      },
      transformResponse: (response: { data: Preclassifier[] }) => response.data,
    }),
    getMethodologiesChartData: builder.mutation<
      Preclassifier[],
      { siteId: string; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        let url = `/card/site/methodologies/${siteId}`;
        if (startDate || endDate) {
          url += `?${startDate ? `startDate=${startDate}&` : ""}${
            endDate ? `endDate=${endDate}` : ""
          }`;
        }
        return url;
      },
      transformResponse: (response: { data: Preclassifier[] }) => response.data,
    }),
    getAreasChartData: builder.mutation<
      Area[],
      { siteId: string; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        let url = `/card/site/areas/more/${siteId}`;
        if (startDate || endDate) {
          url += `?${startDate ? `startDate=${startDate}&` : ""}${
            endDate ? `endDate=${endDate}` : ""
          }`;
        }
        return url;
      },
      transformResponse: (response: { data: Area[] }) => response.data,
    }),
    getMachinesChartData: builder.mutation<
      Machine[],
      { siteId: string; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        let url = `/card/site/machines/${siteId}`;
        if (startDate || endDate) {
          url += `?${startDate ? `startDate=${startDate}&` : ""}${
            endDate ? `endDate=${endDate}` : ""
          }`;
        }
        return url;
      },
      transformResponse: (response: { data: Machine[] }) => response.data,
    }),

    getMachinesByAreaIdChartData: builder.mutation<
      Machine[],
      {
        siteId: string;
        startDate?: string;
        endDate?: string;
        areaId?: number;
      }
    >({
      query: ({ siteId, startDate, endDate, areaId }) => {
         const siteIdInt = parseInt(siteId, 10);
        let url = `/card/site/area/machines/${siteIdInt}/${areaId}`;
        const params = [];

        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);

        if (params.length) {
          url += `?${params.join("&")}`;
        }

        return url;
      },
      transformResponse: (response: { data: Machine[] }) => response.data,
    }),
    getCreatorsChartData: builder.mutation<
      Creator[],
      { siteId: string; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        let url = `/card/site/creators/${siteId}`;
        if (startDate || endDate) {
          url += `?${startDate ? `startDate=${startDate}&` : ""}${
            endDate ? `endDate=${endDate}` : ""
          }`;
        }
        return url;
      },
      transformResponse: (response: { data: Creator[] }) => response.data,
    }),
    getMechanicsChartData: builder.mutation<
      Mechanic[],
      { siteId: string; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        let url = `/card/site/mechanics/${siteId}`;
        if (startDate || endDate) {
          url += `?${startDate ? `startDate=${startDate}&` : ""}${
            endDate ? `endDate=${endDate}` : ""
          }`;
        }
        return url;
      },
      transformResponse: (response: { data: Mechanic[] }) => response.data,
    }),
    getDefinitiveUsersChartData: builder.mutation<
      DefinitiveUser[],
      { siteId: string; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        let url = `/card/site/definitive-user/${siteId}`;
        if (startDate || endDate) {
          url += `?${startDate ? `startDate=${startDate}&` : ""}${
            endDate ? `endDate=${endDate}` : ""
          }`;
        }
        return url;
      },
      transformResponse: (response: { data: DefinitiveUser[] }) =>
        response.data,
    }),
    getWeeksChartData: builder.mutation<Weeks[], string>({
      query: (siteId) => `/card/site/weeks/${siteId}`,
      transformResponse: (response: { data: Weeks[] }) => response.data,
    }),
  }),
});

export const {
  useGetAreasChartDataMutation,
  useGetCreatorsChartDataMutation,
  useGetPreclassifiersChartDataMutation,
  useGetWeeksChartDataMutation,
  useGetMethodologiesChartDataMutation,
  useGetMachinesChartDataMutation,
  useGetMechanicsChartDataMutation,
  useGetDefinitiveUsersChartDataMutation,
  useGetMachinesByAreaIdChartDataMutation 
} = chartService;
