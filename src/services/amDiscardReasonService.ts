import { AmDiscardReason, CreateAmDiscardReasonDTO, UpdateAmDiscardReasonDTO } from "../data/amDiscardReason/amDiscardReason";
import { apiSlice } from "./apiSlice";

export const amDiscardReasonService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAmDiscardReasons: builder.mutation<AmDiscardReason[], number>({
      query: (siteId) => `/am-discard-reasons?siteId=${siteId}`,
      transformResponse: (response: { data: AmDiscardReason[] }) => response.data,
    }),
    getAmDiscardReasonById: builder.query<AmDiscardReason, number>({
      query: (id) => `/am-discard-reasons/${id}`,
      transformResponse: (response: { data: AmDiscardReason }) => response.data,
    }),
    createAmDiscardReason: builder.mutation<void, CreateAmDiscardReasonDTO>({
      query: (data) => ({
        url: '/am-discard-reasons',
        method: 'POST',
        body: data,
      }),
    }),
    updateAmDiscardReason: builder.mutation<void, UpdateAmDiscardReasonDTO>({
      query: (data) => ({
        url: `/am-discard-reasons/${data.id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    deleteAmDiscardReason: builder.mutation<void, number>({
      query: (id) => ({
        url: `/am-discard-reasons/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAmDiscardReasonsMutation,
  useGetAmDiscardReasonByIdQuery,
  useCreateAmDiscardReasonMutation,
  useUpdateAmDiscardReasonMutation,
  useDeleteAmDiscardReasonMutation,
} = amDiscardReasonService; 