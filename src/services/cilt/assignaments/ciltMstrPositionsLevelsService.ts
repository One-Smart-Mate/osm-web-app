import {
    CiltMstrPositionLevel,
    CreateCiltMstrPositionLevelDTO,
    UpdateCiltMstrPositionLevelDTO
  } from "../../../data/cilt/assignaments/ciltMstrPositionsLevels";
  import { apiSlice } from "../../apiSlice";
  
  export const ciltMstrPositionLevelsService = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      getAllCiltMstrPositionLevels: builder.query<CiltMstrPositionLevel[], void>({
        query: () => ({
          url: "/cilt-mstr-position-levels/all",
          method: "GET",
        }),
      }),
  
      getCiltMstrPositionLevelById: builder.query<CiltMstrPositionLevel, number>({
        query: (id) => `/cilt-mstr-position-levels/${id}`,
      }),
  
      createCiltMstrPositionLevel: builder.mutation<CiltMstrPositionLevel, CreateCiltMstrPositionLevelDTO>({
        query: (data) => ({
          url: "/cilt-mstr-position-levels/create",
          method: "POST",
          body: data,
        }),
      }),
  
      updateCiltMstrPositionLevel: builder.mutation<CiltMstrPositionLevel, UpdateCiltMstrPositionLevelDTO>({
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
    useCreateCiltMstrPositionLevelMutation,
    useUpdateCiltMstrPositionLevelMutation,
    useDeleteCiltMstrPositionLevelMutation,
  } = ciltMstrPositionLevelsService;
  