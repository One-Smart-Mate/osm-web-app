import { Level } from "../data/level/level";
import { CreateLevel, MoveLevelDto, UpdateLevel } from "../data/level/level.request";
import { apiSlice } from "./apiSlice";

export const levelService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getlevels: builder.mutation<Level[], string>({
      query: (siteId) => `/level/all/${siteId}/location`,
      transformResponse: (response: { data: Level[] }) => response.data,
    }),

    createLevel: builder.mutation<Level, CreateLevel>({
      query: (level) => ({
        url: "/level/create",
        method: "POST",
        body: { ...level },
      }),
      transformResponse: (response: { data: Level }) => response.data,
    }),
    getlevel: builder.mutation<Level, string>({
      query: (id) => `/level/${id}`,
      transformResponse: (response: { data: Level }) => response.data,
    }),
    udpateLevel: builder.mutation<void, UpdateLevel>({
      query: (level) => ({
        url: "/level/update",
        method: "PUT",
        body: { ...level },
      }),
    }),
    moveLevel: builder.mutation<void, MoveLevelDto>({
      query: (dto) => ({
        url: "/level/move",
        method: "PUT",
        body: { ...dto },
      }),
    }),
    findLevelByMachineId: builder.mutation<{
      level: Level;
      path: string;
      hierarchy: Level[];
    }, { siteId: string; machineId: string }>({
      query: ({ siteId, machineId }) => `/level/machine/${siteId}/${machineId}`,
      transformResponse: (response: { data: any }) => response.data,
    }),

    // New lazy loading endpoints
    getLevelTreeLazy: builder.mutation<{data: any[], parentId: number | null, depth: number}, { siteId: string; parentId?: number; depth?: number }>({
      query: ({ siteId, parentId, depth }) => {
        const params = new URLSearchParams();
        if (parentId !== undefined) params.append('parentId', parentId.toString());
        if (depth !== undefined) params.append('depth', depth.toString());
        return `/level/tree/${siteId}/lazy${params.toString() ? '?' + params.toString() : ''}`;
      },
      transformResponse: (response: { data: any }) => response.data,
    }),

    getChildrenLevels: builder.mutation<any[], { siteId: string; parentId: number }>({
      query: ({ siteId, parentId }) => `/level/tree/${siteId}/children/${parentId}`,
      transformResponse: (response: { data: any[] }) => response.data,
    }),

    getLevelStats: builder.mutation<{
      totalLevels: number;
      activeLevels: number;
      inactiveLevels: number;
      rootLevels: number;
      maxDepth: number;
      performanceWarning: boolean;
    }, string>({
      query: (siteId) => `/level/stats/${siteId}`,
      transformResponse: (response: { data: any }) => response.data,
    }),
  }),
});

export const {
  useGetlevelsMutation,
  useCreateLevelMutation,
  useGetlevelMutation,
  useUdpateLevelMutation,
  useMoveLevelMutation,
  useFindLevelByMachineIdMutation,
  useGetLevelTreeLazyMutation,
  useGetChildrenLevelsMutation,
  useGetLevelStatsMutation,
} = levelService;
