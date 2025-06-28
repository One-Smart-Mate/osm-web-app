import {
  CiltMstrPositionLevel,
  CreateCiltMstrPositionLevelDTO,
  UpdateCiltMstrPositionLevelDTO,
} from "../../../data/cilt/assignaments/ciltMstrPositionsLevels";
import { apiSlice } from "../../apiSlice";

export const ciltMstrPositionLevelsService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCiltMstrPositionLevels: builder.query<CiltMstrPositionLevel[], void>({
      query: () => "/cilt-mstr-position-levels/all",
    }),

    getCiltMstrPositionLevelById: builder.query<CiltMstrPositionLevel, number>({
      query: (id) => `/cilt-mstr-position-levels/${id}`,
    }),

    getCiltMstrPositionLevelsBySiteId: builder.query<
      CiltMstrPositionLevel[],
      number
    >({
      query: (siteId) => `/cilt-mstr-position-levels/site/${siteId}`,
    }),

    getCiltMstrPositionLevelsByCiltMstrId: builder.query<
      CiltMstrPositionLevel[],
      number
    >({
      query: (ciltMstrId) =>
        `/cilt-mstr-position-levels/cilt-mstr/${ciltMstrId}`,
      transformResponse: (response: any) => {
        return response.data || response;
      },
      transformErrorResponse: (response: { status: string | number }) => {
        return { error: `Error ${response.status}` };
      },
    }),

    getCiltMstrPositionLevelsByPositionId: builder.query<
      CiltMstrPositionLevel[],
      number
    >({
      query: (positionId) =>
        `/cilt-mstr-position-levels/position/${positionId}?skipOpl=true`,
      transformResponse: (response: any) => {
        const data = response.data || response;

        return data;
      },

      transformErrorResponse: (response: { status: string | number }) => {
        console.error(
          "API Error en getCiltMstrPositionLevelsByPositionId:",
          response
        );
        return { error: `Error ${response.status}` };
      },
    }),

    getCiltMstrPositionLevelsByLevelId: builder.query<
      CiltMstrPositionLevel[],
      string | number
    >({
      query: (levelId) => ({
        url: `/cilt-mstr-position-levels/level/${levelId}?skipOpl=true`,
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response: any) => {
        return response.data || response;
      },

      transformErrorResponse: (response: { status: string | number }) => {
        console.error("API Error:", response);
        return { error: `Error ${response.status}` };
      },
    }),

    createCiltMstrPositionLevel: builder.mutation<
      CiltMstrPositionLevel,
      CreateCiltMstrPositionLevelDTO
    >({
      query: (data) => ({
        url: "/cilt-mstr-position-levels/create",
        method: "POST",
        body: data,
      }),
    }),

    updateCiltMstrPositionLevel: builder.mutation<
      CiltMstrPositionLevel,
      UpdateCiltMstrPositionLevelDTO
    >({
      query: (data) => ({
        url: "/cilt-mstr-position-levels/update",
        method: "PUT",
        body: data,
      }),
    }),

    deleteCiltMstrPositionLevel: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cilt-mstr-position-levels/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllCiltMstrPositionLevelsQuery,
  useGetCiltMstrPositionLevelByIdQuery,
  useGetCiltMstrPositionLevelsBySiteIdQuery,
  useGetCiltMstrPositionLevelsByCiltMstrIdQuery,
  useGetCiltMstrPositionLevelsByPositionIdQuery,
  useGetCiltMstrPositionLevelsByLevelIdQuery,
  useCreateCiltMstrPositionLevelMutation,
  useUpdateCiltMstrPositionLevelMutation,
  useDeleteCiltMstrPositionLevelMutation,
} = ciltMstrPositionLevelsService;
