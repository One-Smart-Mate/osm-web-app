import { apiSlice } from "../apiSlice";
import { CiltMstr } from "../../data/cilt/ciltMstr/ciltMstr";
import {
  CreateCiltMstrDTO,
  UpdateCiltMstrDTO,
} from "../../data/cilt/ciltMstr/ciltMstr";

export const ciltMstrService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCiltMstrAll: builder.mutation<CiltMstr[], void>({
      query: () => `/cilt-mstr/all`,
      transformResponse: (response: { data: CiltMstr[] }) => response.data,
    }),
    getCiltMstrBySite: builder.query<CiltMstr[], string>({
      query: (siteId) => `/cilt-mstr/site/${siteId}`,
      transformResponse: (response: { data: CiltMstr[] }) => response.data,
    }),
    getCiltMstrByPosition: builder.mutation<CiltMstr[], string>({
      query: (positionId) => `/cilt-mstr/position/${positionId}`,
      transformResponse: (response: { data: CiltMstr[] }) => response.data,
    }),
    getCiltMstrById: builder.mutation<CiltMstr, string>({
      query: (id) => `/cilt-mstr/${id}`,
      transformResponse: (response: { data: CiltMstr }) => response.data,
    }),
    createCiltMstr: builder.mutation<CiltMstr, CreateCiltMstrDTO>({
      query: (newCilt) => ({
        url: `/cilt-mstr/create`,
        method: "POST",
        body: { ...newCilt },
      }),
      transformResponse: (response: { data: CiltMstr }) => response.data,
    }),
    updateCiltMstr: builder.mutation<CiltMstr, UpdateCiltMstrDTO>({
      query: (cilt) => ({
        url: `/cilt-mstr/update`,
        method: "PUT",
        body: { ...cilt },
      }),
      transformResponse: (response: { data: CiltMstr }) => response.data,
    }),
  }),
});

export const {
  useGetCiltMstrAllMutation,
  useGetCiltMstrBySiteQuery, // Changed from Mutation to Query
  useGetCiltMstrByPositionMutation,
  useGetCiltMstrByIdMutation,
  useCreateCiltMstrMutation,
  useUpdateCiltMstrMutation,
} = ciltMstrService;
