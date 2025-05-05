import { apiSlice } from "../apiSlice";
import {
  CiltType,
  CreateCiltTypeDTO,
  UpdateCiltTypeDTO,
} from "../../data/cilt/ciltTypes/ciltTypes";

export const ciltTypesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getCiltTypesAll: builder.mutation<CiltType[], void>({
      query: () => `/cilt-types/all`,
      transformResponse: (response: { data: CiltType[] }) => response.data,
    }),

    
    getCiltTypesBySite: builder.mutation<CiltType[], string>({
      query: (siteId) => `/cilt-types/site/${siteId}`,
      transformResponse: (response: { data: CiltType[] }) => response.data,
    }),

    
    getCiltTypeById: builder.mutation<CiltType, string>({
      query: (id) => `/cilt-types/${id}`,
      transformResponse: (response: { data: CiltType }) => response.data,
    }),

    
    createCiltType: builder.mutation<CiltType, CreateCiltTypeDTO>({
      query: (payload) => ({
        url: `/cilt-types/create`,
        method: "POST",
        body: { ...payload },
      }),
      transformResponse: (response: { data: CiltType }) => response.data,
    }),

    
    updateCiltType: builder.mutation<CiltType, UpdateCiltTypeDTO>({
      query: (payload) => ({
        url: `/cilt-types/update`,
        method: "PUT",
        body: { ...payload },
      }),
      transformResponse: (response: { data: CiltType }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCiltTypesAllMutation,
  useGetCiltTypesBySiteMutation,
  useGetCiltTypeByIdMutation,
  useCreateCiltTypeMutation,
  useUpdateCiltTypeMutation,
} = ciltTypesService;
