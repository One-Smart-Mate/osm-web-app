import { apiSlice } from "../apiSlice";
import {
  OplDetail,
  CreateOplDetailsDTO,
  UpdateOplDetailsDTO,
} from "../../data/cilt/oplDetails/oplDetails";

export const oplDetailsService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /opl-details/all
    getOplDetailsAll: builder.mutation<OplDetail[], void>({
      query: () => `/opl-details/all`,
      transformResponse: (response: { data: OplDetail[] }) => response.data,
    }),
    // GET /opl-details/:id
    getOplDetailById: builder.mutation<OplDetail, string>({
      query: (id) => `/opl-details/${id}`,
      transformResponse: (response: { data: OplDetail }) => response.data,
    }),
    // GET /opl-details/by-opl/:oplId
    getOplDetailsByOpl: builder.mutation<OplDetail[], string | number>({
      query: (oplId) => {
        // Ensure oplId is a string and is not empty
        const id = String(oplId).trim();
        if (!id) {
          throw new Error("OPL ID is required");
        }
        return `/opl-details/by-opl/${id}`;
      },
      transformResponse: (response: { data: OplDetail[] }) =>
        response.data || [],
    }),
    // POST /opl-details/create
    createOplDetail: builder.mutation<OplDetail, CreateOplDetailsDTO>({
      query: (payload) => ({
        url: `/opl-details/create`,
        method: "POST",
        body: { ...payload },
      }),
      transformResponse: (response: { data: OplDetail }) => response.data,
    }),
    // PUT /opl-details/update
    updateOplDetail: builder.mutation<OplDetail, UpdateOplDetailsDTO>({
      query: (payload) => ({
        url: `/opl-details/update`,
        method: "PUT",
        body: { ...payload },
      }),
      transformResponse: (response: { data: OplDetail }) => response.data,
    }),
    // Dentro de oplDetailsService
    updateOplDetailOrder: builder.mutation<
      OplDetail,
      { detailId: number; newOrder: number }
    >({
      query: (payload) => ({
        url: `/opl-details/update-order`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: { data: OplDetail }) => response.data,
    }),
    // DELETE /opl-details/:id
    deleteOplDetail: builder.mutation<void, number>({
      query: (id) => ({
        url: `/opl-details/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOplDetailsAllMutation,
  useGetOplDetailByIdMutation,
  useGetOplDetailsByOplMutation,
  useCreateOplDetailMutation,
  useUpdateOplDetailMutation,
  useUpdateOplDetailOrderMutation,
  useDeleteOplDetailMutation,
} = oplDetailsService;