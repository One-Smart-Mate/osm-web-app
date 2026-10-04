import { apiSlice } from "../apiSlice";
import { OplMstr, CreateOplMstrDTO, UpdateOplMstrDTO, OplUserAccess } from "../../data/cilt/oplMstr/oplMstr";

export const oplMstrService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOplMstrAll: builder.mutation<OplMstr[], void>({
      query: () => `/opl-mstr/all`,
      transformResponse: (response: { data: OplMstr[] }) => response.data,
    }),
    getOplMstrBySite: builder.mutation<OplMstr[], string>({
      query: (siteId) => `/opl-mstr/site/${siteId}`,
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
    getUserOplAccess: builder.query<OplUserAccess[], string | number>({
      query: (userId) => `/opl-mstr/user/${userId}/access`,
      transformResponse: (response: { data: OplUserAccess[] }) => response.data,
    }),
    createOplMstr: builder.mutation<OplMstr, CreateOplMstrDTO>({
      query: ({ creatorId: _creatorId, creatorName: _creatorName, ...payload }) => ({
        url: `/opl-mstr/create`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: OplMstr }) => response.data,
    }),
    updateOplMstr: builder.mutation<OplMstr, UpdateOplMstrDTO>({
      query: ({ creatorId: _creatorId, creatorName: _creatorName, ...payload }) => ({
        url: `/opl-mstr/update`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: { data: OplMstr }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOplMstrAllMutation,
  useGetOplMstrBySiteMutation,
  useGetOplMstrByCreatorMutation,
  useGetOplMstrByIdMutation,
  useGetUserOplAccessQuery,
  useCreateOplMstrMutation,
  useUpdateOplMstrMutation,
} = oplMstrService;
