import { apiSlice } from "../apiSlice";
import {
  CiltSequence,
  CreateCiltSequenceDTO,
  UpdateCiltSequenceDTO,
  UpdateSequenceOrderDTO,
} from "../../data/cilt/ciltSequences/ciltSequences";

export const ciltSequencesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCiltSequencesAll: builder.mutation<CiltSequence[], void>({
      query: () => `/cilt-sequences/all`,
      transformResponse: (response: { data: CiltSequence[] }) => response.data,
    }),
    getCiltSequencesBySite: builder.mutation<CiltSequence[], string>({
      query: (siteId) => `/cilt-sequences/site/${siteId}`,
      transformResponse: (response: { data: CiltSequence[] }) => response.data,
    }),
    getCiltSequencesByPosition: builder.mutation<CiltSequence[], string>({
      query: (positionId) => `/cilt-sequences/position/${positionId}`,
      transformResponse: (response: { data: CiltSequence[] }) => response.data,
    }),
    getCiltSequencesByArea: builder.mutation<CiltSequence[], string>({
      query: (areaId) => `/cilt-sequences/area/${areaId}`,
      transformResponse: (response: { data: CiltSequence[] }) => response.data,
    }),
    getCiltSequencesByCilt: builder.mutation<CiltSequence[], string>({
      query: (ciltMstrId) => `/cilt-sequences/cilt/${ciltMstrId}`,
      transformResponse: (response: { data: CiltSequence[] }) => response.data,
    }),
    getCiltSequencesByLevel: builder.mutation<CiltSequence[], string>({
      query: (levelId) => `/cilt-sequences/level/${levelId}`,
      transformResponse: (response: { data: CiltSequence[] }) => response.data,
    }),
    getCiltSequenceById: builder.mutation<CiltSequence, string>({
      query: (id) => `/cilt-sequences/${id}`,
      transformResponse: (response: { data: CiltSequence }) => response.data,
    }),
    createCiltSequence: builder.mutation<CiltSequence, CreateCiltSequenceDTO>({
      // Only strip fields the backend assigns itself (order). siteId and
      // siteName are REQUIRED by the backend ("siteId and ciltMstrId are
      // required"); previously they were destructured out here, so every
      // create request was sent without siteId and rejected with 400.
      query: ({ order: _order, ...payload }) => ({
        url: `/cilt-sequences/create`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: CiltSequence }) => response.data,
    }),
    updateCiltSequence: builder.mutation<CiltSequence, UpdateCiltSequenceDTO>({
      query: (payload) => ({ url: `/cilt-sequences/update`, method: "PUT", body: { ...payload } }),
      transformResponse: (response: { data: CiltSequence }) => response.data,
    }),
    updateCiltSequenceOrder: builder.mutation<CiltSequence, UpdateSequenceOrderDTO>({
      query: (payload) => ({
        url: `/cilt-sequences/update-order`,
        method: "PUT",
        body: { ...payload },
      }),
      transformResponse: (response: { data: CiltSequence }) => response.data,
    }),
    deleteCiltSequence: builder.mutation<void, string>({
      query: (id) => ({
        url: `/cilt-sequences/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCiltSequencesAllMutation,
  useGetCiltSequencesBySiteMutation,
  useGetCiltSequencesByPositionMutation,
  useGetCiltSequencesByAreaMutation,
  useGetCiltSequencesByCiltMutation,
  useGetCiltSequencesByLevelMutation,
  useGetCiltSequenceByIdMutation,
  useCreateCiltSequenceMutation,
  useUpdateCiltSequenceMutation,
  useUpdateCiltSequenceOrderMutation,
  useDeleteCiltSequenceMutation,
} = ciltSequencesService;
