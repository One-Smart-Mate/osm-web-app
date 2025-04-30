import { apiSlice } from "../apiSlice";
import {
  CiltSequencesEvidence,
  CreateCiltSequencesEvidenceDTO,
  UpdateCiltSequencesEvidenceDTO,
} from "../../data/cilt/ciltSequencesEvidences/ciltSequencesEvidences";

export const ciltSequencesEvidencesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCiltSequencesEvidencesAll: builder.mutation<CiltSequencesEvidence[], void>({
      query: () => `/cilt-sequences-evidences/all`,
      transformResponse: (response: { data: CiltSequencesEvidence[] }) => response.data,
    }),
    getCiltSequencesEvidencesBySite: builder.mutation<CiltSequencesEvidence[], string>({
      query: (siteId) => `/cilt-sequences-evidences/site/${siteId}`,
      transformResponse: (response: { data: CiltSequencesEvidence[] }) => response.data,
    }),
    getCiltSequencesEvidencesByPosition: builder.mutation<CiltSequencesEvidence[], string>({
      query: (positionId) => `/cilt-sequences-evidences/position/${positionId}`,
      transformResponse: (response: { data: CiltSequencesEvidence[] }) => response.data,
    }),
    getCiltSequencesEvidencesByCilt: builder.mutation<CiltSequencesEvidence[], string>({
      query: (ciltId) => `/cilt-sequences-evidences/cilt/${ciltId}`,
      transformResponse: (response: { data: CiltSequencesEvidence[] }) => response.data,
    }),
    getCiltSequencesEvidenceById: builder.mutation<CiltSequencesEvidence, string>({
      query: (id) => `/cilt-sequences-evidences/${id}`,
      transformResponse: (response: { data: CiltSequencesEvidence }) => response.data,
    }),
    createCiltSequencesEvidence: builder.mutation<CiltSequencesEvidence, CreateCiltSequencesEvidenceDTO>({
      query: (payload) => ({ url: `/cilt-sequences-evidences/create`, method: "POST", body: { ...payload } }),
      transformResponse: (response: { data: CiltSequencesEvidence }) => response.data,
    }),
    updateCiltSequencesEvidence: builder.mutation<CiltSequencesEvidence, UpdateCiltSequencesEvidenceDTO>({
      query: (payload) => ({ url: `/cilt-sequences-evidences/update`, method: "PUT", body: { ...payload } }),
      transformResponse: (response: { data: CiltSequencesEvidence }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCiltSequencesEvidencesAllMutation,
  useGetCiltSequencesEvidencesBySiteMutation,
  useGetCiltSequencesEvidencesByPositionMutation,
  useGetCiltSequencesEvidencesByCiltMutation,
  useGetCiltSequencesEvidenceByIdMutation,
  useCreateCiltSequencesEvidenceMutation,
  useUpdateCiltSequencesEvidenceMutation,
} = ciltSequencesEvidencesService;
