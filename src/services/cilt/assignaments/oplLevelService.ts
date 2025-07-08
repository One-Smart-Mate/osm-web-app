import { CreateOplLevelDTO, OplLevel } from "../../../data/cilt/assignaments/oplLevel";
import { apiSlice } from "../../apiSlice";


export const oplLevelsService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOplLevel: builder.mutation<OplLevel, CreateOplLevelDTO>({
      query: (data) => ({
        url: "/opl-levels",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: OplLevel }) => response.data,
      invalidatesTags: ["OplLevel"],
    }),

    deleteOplLevel: builder.mutation<void, number>({
      query: (id) => ({
        url: `/opl-levels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OplLevel"],
    }),

    getOplLevelsByLevelId: builder.query<OplLevel[], number>({
      query: (levelId) => `/opl-levels/level/${levelId}`,
      transformResponse: (response: { data: OplLevel[] }) => response.data,
      providesTags: ["OplLevel"],
    }),
  }),
});

export const {
  useCreateOplLevelMutation,
  useDeleteOplLevelMutation,
  useGetOplLevelsByLevelIdQuery,
} = oplLevelsService;
