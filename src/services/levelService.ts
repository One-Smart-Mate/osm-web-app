import { Level } from "../data/level/level";
import { CreateLevel, UpdateLevel } from "../data/level/level.request";
import { apiSlice } from "./apiSlice";

export const levelService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getlevels: builder.mutation<Level[], string>({
      query: (siteId) => `/level/site/${siteId}`,
      transformResponse: (response: { data: Level[] }) => response.data,
    }),
    createLevel: builder.mutation<void, CreateLevel>({
      query: (level) => ({
        url: "/level/create",
        method: "POST",
        body: { ...level },
      }),
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
  }),
});

export const { useGetlevelsMutation, useCreateLevelMutation, useGetlevelMutation, useUdpateLevelMutation } = levelService;
