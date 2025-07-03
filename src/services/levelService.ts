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
  }),
});

export const {
  useGetlevelsMutation,
  useCreateLevelMutation,
  useGetlevelMutation,
  useUdpateLevelMutation,
  useMoveLevelMutation,
} = levelService;
