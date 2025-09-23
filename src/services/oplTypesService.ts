import { apiSlice } from "./apiSlice";
import { OplTypes } from "../data/oplTypes/oplTypes";
import { CreateOplType, UpdateOplType } from "../data/oplTypes/oplTypes.request";

const oplTypesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOplTypes: builder.mutation<OplTypes[], void>({
      query: () => ({
        url: "opl-types/all",
        method: "GET",
      }),
      transformResponse: (response: { data: OplTypes[] }) => response.data,
    }),
    getOplTypesBySite: builder.mutation<OplTypes[], number>({
      query: (siteId) => ({
        url: `opl-types/site/${siteId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: OplTypes[] }) => response.data,
    }),
    getOplTypeById: builder.mutation<OplTypes, number>({
      query: (id) => ({
        url: `opl-types/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: OplTypes }) => response.data,
    }),
    createOplType: builder.mutation<any, CreateOplType>({
      query: (createOplType) => ({
        url: "opl-types/create",
        method: "POST",
        body: createOplType,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    updateOplType: builder.mutation<any, UpdateOplType>({
      query: (updateOplType) => ({
        url: "opl-types/update",
        method: "PUT",
        body: updateOplType,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    deleteOplType: builder.mutation<any, number>({
      query: (id) => ({
        url: `opl-types/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
  }),
});

export const {
  useGetOplTypesMutation,
  useGetOplTypesBySiteMutation,
  useGetOplTypeByIdMutation,
  useCreateOplTypeMutation,
  useUpdateOplTypeMutation,
  useDeleteOplTypeMutation,
} = oplTypesService; 