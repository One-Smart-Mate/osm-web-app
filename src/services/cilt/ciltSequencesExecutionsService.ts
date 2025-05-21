import { apiSlice } from "../apiSlice";
import {
  CiltSequenceExecution,
  CreateCiltSequencesExecutionDTO,
  UpdateCiltSequencesExecutionDTO,
} from "../../data/cilt/ciltSequencesExecutions/ciltSequencesExecutions";

export const ciltSequencesExecutionsService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCiltSequenceExecutionsAll: builder.mutation<CiltSequenceExecution[], void>({
      query: () => `/cilt-sequences-executions/all`,
      transformResponse: (response: { data: CiltSequenceExecution[] }) => response.data,
    }),
    getCiltSequenceExecutionsBySite: builder.mutation<CiltSequenceExecution[], string>({
      query: (siteId) => `/cilt-sequences-executions/site/${siteId}`,
      transformResponse: (response: { data: CiltSequenceExecution[] }) => response.data,
    }),
    getCiltSequenceExecutionsByPosition: builder.mutation<CiltSequenceExecution[], string>({
      query: (positionId) => `/cilt-sequences-executions/position/${positionId}`,
      transformResponse: (response: { data: CiltSequenceExecution[] }) => response.data,
    }),
    getCiltSequenceExecutionsByCilt: builder.mutation<CiltSequenceExecution[], string>({
      query: (ciltId) => `/cilt-sequences-executions/cilt/${ciltId}`,
      transformResponse: (response: { data: CiltSequenceExecution[] }) => response.data,
    }),
    getCiltSequenceExecutionsByDetails: builder.mutation<CiltSequenceExecution[], string>({
      query: (ciltDetailsId) => `/cilt-sequences-executions/cilt-details/${ciltDetailsId}`,
      transformResponse: (response: { data: CiltSequenceExecution[] }) => response.data,
    }),
    getCiltSequenceExecutionById: builder.mutation<CiltSequenceExecution, string>({
      query: (id) => `/cilt-sequences-executions/${id}`,
      transformResponse: (response: { data: CiltSequenceExecution }) => response.data,
    }),
    createCiltSequenceExecution: builder.mutation<CiltSequenceExecution, CreateCiltSequencesExecutionDTO>({
      query: (payload) => ({ url: `/cilt-sequences-executions/create`, method: "POST", body: { ...payload } }),
      transformResponse: (response: { data: CiltSequenceExecution }) => response.data,
    }),
    updateCiltSequenceExecution: builder.mutation<CiltSequenceExecution, UpdateCiltSequencesExecutionDTO>({
      query: (payload) => ({ url: `/cilt-sequences-executions/update`, method: "PUT", body: { ...payload } }),
      transformResponse: (response: { data: CiltSequenceExecution }) => response.data,
    }),

    deleteCiltSequenceExecution: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cilt-sequences-executions/${id}`,
        method: "DELETE",
      }),
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useGetCiltSequenceExecutionsAllMutation,
  useGetCiltSequenceExecutionsBySiteMutation,
  useGetCiltSequenceExecutionsByPositionMutation,
  useGetCiltSequenceExecutionsByCiltMutation,
  useGetCiltSequenceExecutionsByDetailsMutation,
  useGetCiltSequenceExecutionByIdMutation,
  useCreateCiltSequenceExecutionMutation,
  useUpdateCiltSequenceExecutionMutation,
  useDeleteCiltSequenceExecutionMutation,
} = ciltSequencesExecutionsService;
