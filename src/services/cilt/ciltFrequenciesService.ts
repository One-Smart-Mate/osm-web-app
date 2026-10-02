import { apiSlice } from "../apiSlice";
import {
  CiltFrequency,
  CreateCiltFrequenciesDTO,
  UpdateCiltFrequenciesDTO,
} from "../../data/cilt/ciltFrequencies/ciltFrequencies";

export const ciltFrequenciesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Site-scoped first (new backend); falls back to /all for older backends (prod)
    getCiltFrequenciesAll: builder.mutation<CiltFrequency[], string>({
      async queryFn(siteId, _api, _extra, baseQuery) {
        const bySite = await baseQuery(`/cilt-frequencies/site/${siteId}`);
        if (!bySite.error) {
          const payload = bySite.data as { data: CiltFrequency[] };
          return { data: payload.data };
        }
        // Older backends (prod) lack the site endpoint -> use /all
        const all = await baseQuery(`/cilt-frequencies/all`);
        if (all.error) {
          return { error: all.error };
        }
        const payload = all.data as { data: CiltFrequency[] };
        const list = Array.isArray(payload.data) ? payload.data : [];
        const filtered = list.filter(
          (item) => item.siteId === Number(siteId),
        );
        return { data: filtered };
      },
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
