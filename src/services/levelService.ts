import { Level } from "../data/level/level";
import { CreateLevel, MoveLevelDto, UpdateLevel } from "../data/level/level.request";
import { apiSlice } from "./apiSlice";

// Paginated levels response interface
interface PaginatedLevelsResponse {
  data: Level[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export const levelService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getlevels: builder.mutation<Level[], { siteId: string; page?: number; limit?: number }>({
      query: ({ siteId, page = 1, limit = 999999 }) => `/level/all/${siteId}/location?page=${page}&limit=${limit}`,
      transformResponse: (response: { data: PaginatedLevelsResponse }) => response.data.data,
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
    getLevelTreeLazy: builder.mutation<{
      data: any[];
      parentId: number | null;
      depth: number;
    }, { siteId: string; parentId?: number; depth?: number; page?: number; limit?: number }>({
      query: ({ siteId, parentId, depth, page = 1, limit = 999999 }) => {
        const params = new URLSearchParams();
        if (parentId !== undefined) params.append('parentId', parentId.toString());
        if (depth !== undefined) params.append('depth', depth.toString());
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `/level/tree/${siteId}/lazy${params.toString() ? '?' + params.toString() : ''}`;
      },
      transformResponse: (response: { data: any }) => {
        // Return backend structure but with only data array (for backward compatibility)
        return {
          data: response.data.data,
          parentId: response.data.parentId,
          depth: response.data.depth
        };
      },
    }),

    getChildrenLevels: builder.mutation<any[], { siteId: string; parentId: number; page?: number; limit?: number }>({
      query: ({ siteId, parentId, page = 1, limit = 999999 }) =>
        `/level/tree/${siteId}/children/${parentId}?page=${page}&limit=${limit}`,
      transformResponse: (response: { data: any }) => response.data.data,
    }),

    getLevelStats: builder.mutation<{
      totalLevels: number;
      activeLevels: number;
      inactiveLevels: number;
      rootLevels: number;
      maxDepth: number;
      performanceWarning: boolean;
    }, { siteId: string; page?: number; limit?: number }>({
      query: ({ siteId, page = 1, limit = 999999 }) => `/level/stats/${siteId}?page=${page}&limit=${limit}`,
      transformResponse: (response: { data: any }) => response.data.stats,
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
