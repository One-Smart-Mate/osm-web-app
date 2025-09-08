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

// CILT Chart Types
export interface CiltExecutionChart {
  date: string;
  programmed: number;
  executed: number;
}

export interface CiltComplianceChart {
  userId: number;
  userName: string;
  assigned: number;
  executed: number;
  compliancePercentage: number;
}

export interface CiltTimeChart {
  date: string;
  standardTime: number;
  realTime: number;
  executedCount: number;
  standardTimeMinutes: number;
  realTimeMinutes: number;
  efficiencyPercentage: number;
}

export interface CiltAnomaliesChart {
  date: string;
  totalAnomalies: number;
  nokAnomalies: number;
  amTagAnomalies: number;
  stoppageAnomalies: number;
}

export interface CiltChartFilters {
  startDate: string;
  endDate: string;
  siteId?: number;
  positionId?: number;
  levelId?: number;
}

export const chartService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPreclassifiersChartData: builder.mutation<
      Preclassifier[],
      { siteId: string; startDate?: string; endDate?: string; status?: string }
    >({
      query: ({ siteId, startDate, endDate, status }) => {
        let url = `/card/site/preclassifiers/${siteId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        return url;
      },
      transformResponse: (response: { data: Preclassifier[] }) => response.data,
    }),
    getMethodologiesChartData: builder.mutation<
      Preclassifier[],
      { siteId: string; startDate?: string; endDate?: string; status?: string }
    >({
      query: ({ siteId, startDate, endDate, status }) => {
        let url = `/card/site/methodologies/${siteId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        return url;
      },
      transformResponse: (response: { data: Preclassifier[] }) => response.data,
    }),
    getAreasChartData: builder.mutation<
      Area[],
      { siteId: string; startDate?: string; endDate?: string; status?: string }
    >({
      query: ({ siteId, startDate, endDate, status }) => {
        let url = `/card/site/areas/more/${siteId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        return url;
      },
      transformResponse: (response: { data: Area[] }) => response.data,
    }),
    getMachinesChartData: builder.mutation<
      Machine[],
      { siteId: string; startDate?: string; endDate?: string; status?: string }
    >({
      query: ({ siteId, startDate, endDate, status }) => {
        let url = `/card/site/machines/${siteId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) {
          url += `?${params.join('&')}`;
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
        status?: string;
      }
    >({
      query: ({ siteId, startDate, endDate, areaId, status }) => {
         const siteIdInt = parseInt(siteId, 10);
        let url = `/card/site/area/machines/${siteIdInt}/${areaId}`;
        const params = [];

        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);

        if (params.length) {
          url += `?${params.join("&")}`;
        }

        return url;
      },
      transformResponse: (response: { data: Machine[] }) => response.data,
    }),
    getCreatorsChartData: builder.mutation<
      Creator[],
      { siteId: string; startDate?: string; endDate?: string; status?: string }
    >({
      query: ({ siteId, startDate, endDate, status }) => {
        let url = `/card/site/creators/${siteId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        return url;
      },
      transformResponse: (response: { data: Creator[] }) => response.data,
    }),
    getMechanicsChartData: builder.mutation<
      Mechanic[],
      { siteId: string; startDate?: string; endDate?: string; status?: string }
    >({
      query: ({ siteId, startDate, endDate, status }) => {
        let url = `/card/site/mechanics/${siteId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        return url;
      },
      transformResponse: (response: { data: Mechanic[] }) => response.data,
    }),
    getDefinitiveUsersChartData: builder.mutation<
      DefinitiveUser[],
      { siteId: string; startDate?: string; endDate?: string; status?: string }
    >({
      query: ({ siteId, startDate, endDate, status }) => {
        let url = `/card/site/definitive-user/${siteId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (status) params.push(`status=${status}`);
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        return url;
      },
      transformResponse: (response: { data: DefinitiveUser[] }) =>
        response.data,
    }),
    getWeeksChartData: builder.mutation<Weeks[], { siteId: string; status?: string }>({
      query: ({ siteId, status }) => {
        let url = `/card/site/weeks/${siteId}`;
        if (status) {
          url += `?status=${status}`;
        }
        return url;
      },
      transformResponse: (response: { data: Weeks[] }) => response.data,
    }),

    // CILT Chart endpoints
    getCiltExecutionChartData: builder.mutation<
      CiltExecutionChart[],
      CiltChartFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        if (filters.siteId) params.append('siteId', filters.siteId.toString());
        if (filters.positionId) params.append('positionId', filters.positionId.toString());
        if (filters.levelId) params.append('levelId', filters.levelId.toString());
        
        return `/cilt-sequences-executions/charts/execution?${params.toString()}`;
      },
      transformResponse: (response: { data: CiltExecutionChart[] }) => response.data,
    }),

    getCiltComplianceChartData: builder.mutation<
      CiltComplianceChart[],
      CiltChartFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        if (filters.siteId) params.append('siteId', filters.siteId.toString());
        if (filters.positionId) params.append('positionId', filters.positionId.toString());
        if (filters.levelId) params.append('levelId', filters.levelId.toString());
        
        return `/cilt-sequences-executions/charts/compliance?${params.toString()}`;
      },
      transformResponse: (response: { data: CiltComplianceChart[] }) => response.data,
    }),

    getCiltTimeChartData: builder.mutation<
      CiltTimeChart[],
      CiltChartFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        if (filters.siteId) params.append('siteId', filters.siteId.toString());
        if (filters.positionId) params.append('positionId', filters.positionId.toString());
        if (filters.levelId) params.append('levelId', filters.levelId.toString());
        
        return `/cilt-sequences-executions/charts/time?${params.toString()}`;
      },
      transformResponse: (response: { data: CiltTimeChart[] }) => response.data,
    }),

    getCiltAnomaliesChartData: builder.mutation<
      CiltAnomaliesChart[],
      CiltChartFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        if (filters.siteId) params.append('siteId', filters.siteId.toString());
        if (filters.positionId) params.append('positionId', filters.positionId.toString());
        if (filters.levelId) params.append('levelId', filters.levelId.toString());
        
        return `/cilt-sequences-executions/charts/anomalies?${params.toString()}`;
      },
      transformResponse: (response: { data: CiltAnomaliesChart[] }) => response.data,
    }),
  }),
});

export const {
  useGetPreclassifiersChartDataMutation,
  useGetMethodologiesChartDataMutation,
  useGetAreasChartDataMutation,
  useGetMachinesChartDataMutation,
  useGetMachinesByAreaIdChartDataMutation,
  useGetCreatorsChartDataMutation,
  useGetMechanicsChartDataMutation,
  useGetDefinitiveUsersChartDataMutation,
  useGetWeeksChartDataMutation,
  // CILT Chart hooks
  useGetCiltExecutionChartDataMutation,
  useGetCiltComplianceChartDataMutation,
  useGetCiltTimeChartDataMutation,
  useGetCiltAnomaliesChartDataMutation,
} = chartService;
