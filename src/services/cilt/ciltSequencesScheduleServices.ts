import { 
  CiltSecuencesSchedule, 
  CreateCiltSecuencesScheduleDto, 
  UpdateCiltSecuencesScheduleDto 
} from "../../data/cilt/ciltSequencesSchedule/ciltSequencesSchedules";
import { apiSlice } from "../apiSlice";

export const ciltSecuencesScheduleService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /cilt-secuences-schedule/all
    getAllSchedules: builder.mutation<CiltSecuencesSchedule[], void>({
      query: () => `/cilt-secuences-schedule/all`,
      transformResponse: (response: { data: CiltSecuencesSchedule[] }) => response.data,
    }),

    // GET /cilt-secuences-schedule/site/:siteId
    getSchedulesBySiteId: builder.mutation<CiltSecuencesSchedule[], string>({
      query: (siteId) => `/cilt-secuences-schedule/site/${siteId}`,
      transformResponse: (response: { data: CiltSecuencesSchedule[] }) => response.data,
    }),

    // GET /cilt-secuences-schedule/cilt/:ciltId
    getSchedulesByCiltId: builder.mutation<CiltSecuencesSchedule[], string>({
      query: (ciltId) => `/cilt-secuences-schedule/cilt/${ciltId}`,
      transformResponse: (response: { data: CiltSecuencesSchedule[] }) => response.data,
    }),

    // GET /cilt-secuences-schedule/:id
    getScheduleById: builder.mutation<CiltSecuencesSchedule, string>({
      query: (id) => `/cilt-secuences-schedule/${id}`,
      transformResponse: (response: { data: CiltSecuencesSchedule }) => response.data,
    }),

    // GET /cilt-secuences-schedule/date/:date
    getSchedulesForDate: builder.mutation<CiltSecuencesSchedule[], string>({
      query: (date) => `/cilt-secuences-schedule/date/${date}`,
      transformResponse: (response: { data: CiltSecuencesSchedule[] }) => response.data,
    }),

    // GET /cilt-secuences-schedule/date-simplified/:date
    getSchedulesForDateSimplified: builder.mutation<CiltSecuencesSchedule[], string>({
      query: (date) => `/cilt-secuences-schedule/date-simplified/${date}`,
      transformResponse: (response: { data: CiltSecuencesSchedule[] }) => response.data,
    }),

    // GET /cilt-secuences-schedule/sequence/:sequenceId
    getSchedulesBySequenceId: builder.mutation<CiltSecuencesSchedule[], number>({
      query: (sequenceId) => `/cilt-secuences-schedule/sequence/${sequenceId}`,
      transformResponse: (response: { data: CiltSecuencesSchedule[] }) => response.data,
    }),

    // POST /cilt-secuences-schedule/create
    createSchedule: builder.mutation<CiltSecuencesSchedule, CreateCiltSecuencesScheduleDto>({
      query: (payload) => ({
        url: `/cilt-secuences-schedule/create`,
        method: "POST",
        body: { ...payload },
      }),
      transformResponse: (response: { data: CiltSecuencesSchedule }) => response.data,
    }),

    // PUT /cilt-secuences-schedule/update
    updateSchedule: builder.mutation<CiltSecuencesSchedule, UpdateCiltSecuencesScheduleDto>({
      query: (payload) => ({
        url: `/cilt-secuences-schedule/update`,
        method: "PUT",
        body: { ...payload },
      }),
      transformResponse: (response: { data: CiltSecuencesSchedule }) => response.data,
    }),

    // DELETE /cilt-secuences-schedule/:id
    deleteSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/cilt-secuences-schedule/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllSchedulesMutation,
  useGetSchedulesBySiteIdMutation,
  useGetSchedulesByCiltIdMutation,
  useGetScheduleByIdMutation,
  useGetSchedulesForDateMutation,
  useGetSchedulesForDateSimplifiedMutation,
  useGetSchedulesBySequenceIdMutation,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = ciltSecuencesScheduleService;