import { apiSlice } from "../apiSlice";
import {
  CiltSequenceFrequency,
  CreateCiltSequencesFrequenciesDTO,
  UpdateCiltSequencesFrequenciesDTO,
} from "../../data/cilt/ciltSequencesFrequencies/ciltSequencesFrequencies";

export const ciltSequencesFrequenciesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCiltSequenceFrequenciesAll: builder.mutation<CiltSequenceFrequency[], void>({
      query: () => `/cilt-sequences-frequencies/all`,
      transformResponse: (response: { data: CiltSequenceFrequency[] }) => response.data,
    }),
    getCiltSequenceFrequenciesBySite: builder.mutation<CiltSequenceFrequency[], string>({
      query: (siteId) => `/cilt-sequences-frequencies/site/${siteId}`,
      transformResponse: (response: { data: CiltSequenceFrequency[] }) => response.data,
    }),
    getCiltSequenceFrequenciesByPosition: builder.mutation<CiltSequenceFrequency[], string>({
      query: (positionId) => `/cilt-sequences-frequencies/position/${positionId}`,
      transformResponse: (response: { data: CiltSequenceFrequency[] }) => response.data,
    }),
    getCiltSequenceFrequenciesByCilt: builder.mutation<CiltSequenceFrequency[], string>({
      query: (ciltId) => `/cilt-sequences-frequencies/cilt/${ciltId}`,
      transformResponse: (response: { data: CiltSequenceFrequency[] }) => response.data,
    }),
    getCiltSequenceFrequenciesByFrequency: builder.mutation<CiltSequenceFrequency[], string>({
      query: (frecuencyId) => `/cilt-sequences-frequencies/frequency/${frecuencyId}`,
      transformResponse: (response: { data: CiltSequenceFrequency[] }) => response.data,
    }),
    getCiltSequenceFrequencyById: builder.mutation<CiltSequenceFrequency, string>({
      query: (id) => `/cilt-sequences-frequencies/${id}`,
      transformResponse: (response: { data: CiltSequenceFrequency }) => response.data,
    }),
    createCiltSequenceFrequency: builder.mutation<CiltSequenceFrequency, CreateCiltSequencesFrequenciesDTO>({
      query: (payload) => ({ url: `/cilt-sequences-frequencies/create`, method: "POST", body: { ...payload } }),
      transformResponse: (response: { data: CiltSequenceFrequency }) => response.data,
    }),
    updateCiltSequenceFrequency: builder.mutation<CiltSequenceFrequency, UpdateCiltSequencesFrequenciesDTO>({
      query: (payload) => ({ url: `/cilt-sequences-frequencies/update`, method: "PUT", body: { ...payload } }),
      transformResponse: (response: { data: CiltSequenceFrequency }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCiltSequenceFrequenciesAllMutation,
  useGetCiltSequenceFrequenciesBySiteMutation,
  useGetCiltSequenceFrequenciesByPositionMutation,
  useGetCiltSequenceFrequenciesByCiltMutation,
  useGetCiltSequenceFrequenciesByFrequencyMutation,
  useGetCiltSequenceFrequencyByIdMutation,
  useCreateCiltSequenceFrequencyMutation,
  useUpdateCiltSequenceFrequencyMutation,
} = ciltSequencesFrequenciesService;
