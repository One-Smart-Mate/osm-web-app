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
    getOplDetailsByOpl: builder.mutation<OplDetail[], string>({
      query: (oplId) => `/opl-details/by-opl/${oplId}`,
      transformResponse: (response: { data: OplDetail[] }) => response.data,
    }),
    // POST /opl-details/create
    createOplDetail: builder.mutation<OplDetail, CreateOplDetailsDTO>({
      query: (payload) => ({ url: `/opl-details/create`, method: "POST", body: { ...payload } }),
      transformResponse: (response: { data: OplDetail }) => response.data,
    }),
    // PUT /opl-details/update
    updateOplDetail: builder.mutation<OplDetail, UpdateOplDetailsDTO>({
      query: (payload) => ({ url: `/opl-details/update`, method: "PUT", body: { ...payload } }),
      transformResponse: (response: { data: OplDetail }) => response.data,
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
} = oplDetailsService;
