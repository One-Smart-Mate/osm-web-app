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
    getPreclassifiersChartData: builder.mutation<Preclassifier[], string>({
      query: (siteId) => `/card/site/preclassifiers/${siteId}`,
      transformResponse: (response: { data: Preclassifier[] }) => response.data,
    }),
    getMethodologiesChartData: builder.mutation<Preclassifier[], string>({
      query: (siteId) => `/card/site/methodologies/${siteId}`,
      transformResponse: (response: { data: Preclassifier[] }) => response.data,
    }),
    getAreasChartData: builder.mutation<Area[], string>({
      query: (siteId) => `/card/site/areas/${siteId}`,
      transformResponse: (response: { data: Area[] }) => response.data,
    }),
    getMachinesChartData: builder.mutation<Machine[], string>({
      query: (siteId) => `/card/site/machines/${siteId}`,
      transformResponse: (response: { data: Machine[] }) => response.data,
    }),
    getCreatorsChartData: builder.mutation<Creator[], string>({
      query: (siteId) => `/card/site/creators/${siteId}`,
      transformResponse: (response: { data: Creator[] }) => response.data,
    }),
    getMechanicsChartData: builder.mutation<Mechanic[], string>({
      query: (siteId) => `/card/site/mechanics/${siteId}`,
      transformResponse: (response: { data: Mechanic[] }) => response.data,
    }),
    getDefinitiveUsersChartData: builder.mutation<DefinitiveUser[], string>({
      query: (siteId) => `/card/site/definitive-user/${siteId}`,
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
  useGetDefinitiveUsersChartDataMutation
} = chartService;
