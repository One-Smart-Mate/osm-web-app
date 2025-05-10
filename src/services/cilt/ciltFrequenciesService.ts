import { apiSlice } from "../apiSlice";
import {
  CiltFrequency,
  CreateCiltFrequenciesDTO,
  UpdateCiltFrequenciesDTO,
} from "../../data/cilt/ciltFrequencies/ciltFrequencies";

export const ciltFrequenciesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /cilt-frequencies/alla
    getCiltFrequenciesAll: builder.mutation<CiltFrequency[], void>({
      query: () => `/cilt-frequencies/all`,
      transformResponse: (response: { data: CiltFrequency[] }) => response.data,
    }),

    getCiltTypesBySite: builder.mutation<CiltFrequency[], string>({
      query: (siteId) => `/cilt-types/site/${siteId}`,
      transformResponse: (response: { data: CiltFrequency[] }) => response.data,
    }),

    // GET /cilt-frequencies/:id
    getCiltFrequencyById: builder.mutation<CiltFrequency, string>({
      query: (id) => `/cilt-frequencies/${id}`,
      transformResponse: (response: { data: CiltFrequency }) => response.data,
    }),

    // POST /cilt-frequencies/create
    createCiltFrequency: builder.mutation<CiltFrequency, CreateCiltFrequenciesDTO>({
      query: (payload) => ({
        url: `/cilt-frequencies/create`,
        method: "POST",
        body: { ...payload },
      }),
      transformResponse: (response: { data: CiltFrequency }) => response.data,
    }),

    // PUT /cilt-frequencies/update
    updateCiltFrequency: builder.mutation<CiltFrequency, UpdateCiltFrequenciesDTO>({
      query: (payload) => ({
        url: `/cilt-frequencies/update`,
        method: "PUT",
        body: { ...payload },
      }),
      transformResponse: (response: { data: CiltFrequency }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCiltFrequenciesAllMutation,
   useGetCiltTypesBySiteMutation,
  useGetCiltFrequencyByIdMutation,
  useCreateCiltFrequencyMutation,
  useUpdateCiltFrequencyMutation,
} = ciltFrequenciesService;
