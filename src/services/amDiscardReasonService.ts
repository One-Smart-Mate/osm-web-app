import { AmDiscardReason, CreateAmDiscardReasonDTO, UpdateAmDiscardReasonDTO } from "../data/amDiscardReason/amDiscardReason";
import { apiSlice } from "./apiSlice";

export const amDiscardReasonService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAmDiscardReasons: builder.query<AmDiscardReason[], number>({
      query: (siteId) => `/am-discard-reasons?siteId=${siteId}`,
      transformResponse: (response: { data: AmDiscardReason[] }) => response.data,
      providesTags: ["AmDiscardReason"],
    }),
    getAmDiscardReasonById: builder.query<AmDiscardReason, number>({
      query: (id) => `/am-discard-reasons/${id}`,
      transformResponse: (response: { data: AmDiscardReason }) => response.data,
      providesTags: ["AmDiscardReason"],
    }),
    createAmDiscardReason: builder.mutation<void, CreateAmDiscardReasonDTO>({
      query: (data) => ({
        url: '/am-discard-reasons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ["AmDiscardReason"],
    }),
    updateAmDiscardReason: builder.mutation<void, UpdateAmDiscardReasonDTO>({
      query: (data) => ({
        url: `/am-discard-reasons/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["AmDiscardReason"],
    }),
    deleteAmDiscardReason: builder.mutation<void, number>({
      query: (id) => ({
        url: `/am-discard-reasons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["AmDiscardReason"],
    }),
  }),
});

export const {
  useGetAmDiscardReasonsQuery,
  useGetAmDiscardReasonByIdQuery,
  useCreateAmDiscardReasonMutation,
  useUpdateAmDiscardReasonMutation,
  useDeleteAmDiscardReasonMutation,
} = amDiscardReasonService; 