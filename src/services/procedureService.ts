import { apiSlice } from "./apiSlice";

const procedureUrl = "/cilt-mstr-position-levels";

export const procedureService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get procedures by level with recent executions
    getProceduresByLevel: builder.mutation<any, string>({
      query: (levelId) => `${procedureUrl}/level/${levelId}/recent-executions`,
      transformResponse: (response: { data: any }) => response.data || response,
    }),
    // Get procedures by level without executions
    getProceduresByLevelBasic: builder.mutation<any, string>({
      query: (levelId) => `${procedureUrl}/level/${levelId}`,
      transformResponse: (response: { data: any }) => response.data || response,
    }),
    // Create execution for a sequence
    createProcedureExecution: builder.mutation<any, { sequenceId: number; userId: number }>({
      query: (data) => ({
        url: `/cilt-sequences-executions/create`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: any }) => response,
    }),
    // Start execution
    startProcedureExecution: builder.mutation<any, { id: number; startDate: string }>({
      query: (data) => ({
        url: `/cilt-sequences-executions/start`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: any }) => response,
    }),
    // Complete execution
    completeProcedureExecution: builder.mutation<any, any>({
      query: (data) => ({
        url: `/cilt-sequences-executions/complete`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: any }) => response,
    }),
    // Get sequence by ID
    getSequenceById: builder.query<any, number>({
      query: (sequenceId) => `/cilt-sequences/${sequenceId}`,
      transformResponse: (response: { data: any }) => response.data || response,
    }),
  }),
});

export const {
  useGetProceduresByLevelMutation,
  useGetProceduresByLevelBasicMutation,
  useCreateProcedureExecutionMutation,
  useStartProcedureExecutionMutation,
  useCompleteProcedureExecutionMutation,
  useGetSequenceByIdQuery,
} = procedureService;