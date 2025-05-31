import { apiSlice } from '../apiSlice';
import {
  CiltSecuencesSchedule,
  CreateCiltSecuencesScheduleDTO,
  UpdateCiltSecuencesScheduleDTO,
} from '../../data/cilt/ciltSecuencesSchedule/ciltSecuencesSchedule';

export const ciltSecuencesScheduleService = apiSlice.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all active schedules
    getActiveSchedules: builder.query<CiltSecuencesSchedule[], void>({
      query: () => '/cilt-secuences-schedule/all',
      transformResponse: (res: { data: CiltSecuencesSchedule[] }) => res.data,
    }),

    // Get schedules by site ID
    getSchedulesBySite: builder.query<CiltSecuencesSchedule[], number>({
      query: (siteId) => `/cilt-secuences-schedule/site/${siteId}`,
      transformResponse: (res: { data: CiltSecuencesSchedule[] }) => res.data,
    }),

    // Get schedules by CILT ID
    getSchedulesByCilt: builder.query<CiltSecuencesSchedule[], number>({
      query: (ciltId) => `/cilt-secuences-schedule/cilt/${ciltId}`,
      transformResponse: (res: { data: CiltSecuencesSchedule[] }) => res.data,
    }),

    // Get a schedule by its ID
    getScheduleById: builder.query<CiltSecuencesSchedule, number>({
      query: (id) => `/cilt-secuences-schedule/${id}`,
      transformResponse: (res: { data: CiltSecuencesSchedule }) => res.data,
    }),

    // Get schedules for a specific date (full detail)
    getSchedulesForDate: builder.query<CiltSecuencesSchedule[], string>({
      query: (date) => `/cilt-secuences-schedule/date/${date}`,
      transformResponse: (res: { data: CiltSecuencesSchedule[] }) => res.data,
    }),

    // Get simplified schedules for a specific date (id, siteId, ciltId, secuenceId)
    getSchedulesForDateSimplified: builder.query<
      Pick<CiltSecuencesSchedule, 'id' | 'siteId' | 'ciltId' | 'secuenceId'>[],
      string
    >({
      query: (date) => `/cilt-secuences-schedule/date-simplified/${date}`,
      transformResponse: (res: { data: Pick<CiltSecuencesSchedule, 'id' | 'siteId' | 'ciltId' | 'secuenceId'>[] }) => res.data,
    }),

    // Get schedules by sequence ID
    getSchedulesBySequence: builder.query<CiltSecuencesSchedule[], number>({
      query: (seqId) => `/cilt-secuences-schedule/sequences/${seqId}`,
      transformResponse: (res: { data: CiltSecuencesSchedule[] }) => res.data,
    }),

    // Create a new schedule
    createSchedule: builder.mutation<
      CiltSecuencesSchedule,
      CreateCiltSecuencesScheduleDTO
    >({
      query: (newSchedule) => ({
        url: '/cilt-secuences-schedule/create',
        method: 'POST',
        body: newSchedule,
      }),
      transformResponse: (res: { data: CiltSecuencesSchedule }) => res.data,
    }),

    // Update an existing schedule
    updateSchedule: builder.mutation<
      CiltSecuencesSchedule,
      UpdateCiltSecuencesScheduleDTO
    >({
      query: (schedule) => ({
        url: '/cilt-secuences-schedule/update',
        method: 'PUT',
        body: schedule,
      }),
      transformResponse: (res: { data: CiltSecuencesSchedule }) => res.data,
    }),

    // Soft-delete a schedule
    deleteSchedule: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cilt-secuences-schedule/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetActiveSchedulesQuery,
  useGetSchedulesBySiteQuery,
  useGetSchedulesByCiltQuery,
  useGetScheduleByIdQuery,
  useGetSchedulesForDateQuery,
  useGetSchedulesForDateSimplifiedQuery,
  useGetSchedulesBySequenceQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = ciltSecuencesScheduleService;
