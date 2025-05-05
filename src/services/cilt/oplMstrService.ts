import { apiSlice } from "../apiSlice";
import { OplMstr, CreateOplMstrDTO, UpdateOplMstrDTO } from "../../data/cilt/oplMstr/oplMstr";

export const oplMstrService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOplMstrAll: builder.mutation<OplMstr[], void>({
      query: () => `/opl-mstr/all`,
      transformResponse: (response: { data: OplMstr[] }) => response.data,
    }),
    getOplMstrByCreator: builder.mutation<OplMstr[], string>({
      query: (creatorId) => `/opl-mstr/creator/${creatorId}`,
      transformResponse: (response: { data: OplMstr[] }) => response.data,
    }),
    getOplMstrById: builder.mutation<OplMstr, string>({
      query: (id) => `/opl-mstr/${id}`,
      transformResponse: (response: { data: OplMstr }) => response.data,
    }),
    createOplMstr: builder.mutation<OplMstr, CreateOplMstrDTO>({
      query: (payload) => ({ url: `/opl-mstr/create`, method: "POST", body: { ...payload } }),
      transformResponse: (response: { data: OplMstr }) => response.data,
    }),
    updateOplMstr: builder.mutation<OplMstr, UpdateOplMstrDTO>({
      query: (payload) => ({ url: `/opl-mstr/update`, method: "PUT", body: { ...payload } }),
      transformResponse: (response: { data: OplMstr }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOplMstrAllMutation,
  useGetOplMstrByCreatorMutation,
  useGetOplMstrByIdMutation,
  useCreateOplMstrMutation,
  useUpdateOplMstrMutation,
} = oplMstrService;
