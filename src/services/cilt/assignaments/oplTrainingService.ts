import { apiSlice } from "../../apiSlice";
import {
  AssignOplToPositionDTO,
  OplPositionAssignment,
  OplTrainingMatrix,
  OplTrainingRecord,
} from "../../../data/cilt/assignaments/oplTraining";

export const oplTrainingService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Assignment (admin) ---
    assignOplToPosition: builder.mutation<any, AssignOplToPositionDTO>({
      query: (data) => ({
        url: "/opl-training/assign",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: any }) => response.data,
      invalidatesTags: ["OplTraining"],
    }),

    removeOplPositionAssignment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/opl-training/assign/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OplTraining"],
    }),

    getPositionsByOpl: builder.query<OplPositionAssignment[], number>({
      query: (oplId) => `/opl-training/positions/opl/${oplId}`,
      transformResponse: (response: { data: OplPositionAssignment[] }) =>
        response.data,
      providesTags: ["OplTraining"],
    }),

    // --- Matrix (admin) ---
    getTrainingMatrixBySite: builder.query<OplTrainingMatrix, number>({
      query: (siteId) => `/opl-training/matrix/site/${siteId}`,
      transformResponse: (response: { data: OplTrainingMatrix }) =>
        response.data,
      providesTags: ["OplTraining"],
    }),

    // --- Supervisor ---
    validateTraining: builder.mutation<any, number[]>({
      query: (recordIds) => ({
        url: "/opl-training/validate",
        method: "POST",
        body: { recordIds },
      }),
      invalidatesTags: ["OplTraining"],
    }),

    // --- User ---
    getMyTrainingRecords: builder.query<OplTrainingRecord[], void>({
      query: () => "/opl-training/my-records",
      transformResponse: (response: { data: OplTrainingRecord[] }) =>
        response.data,
      providesTags: ["OplTraining"],
    }),

    selfCompleteTraining: builder.mutation<any, number>({
      query: (oplId) => ({
        url: "/opl-training/self-complete",
        method: "POST",
        body: { oplId },
      }),
      invalidatesTags: ["OplTraining"],
    }),
  }),
});

export const {
  useAssignOplToPositionMutation,
  useRemoveOplPositionAssignmentMutation,
  useGetPositionsByOplQuery,
  useGetTrainingMatrixBySiteQuery,
  useValidateTrainingMutation,
  useGetMyTrainingRecordsQuery,
  useSelfCompleteTrainingMutation,
} = oplTrainingService;
