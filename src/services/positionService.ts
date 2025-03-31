import { CreatePosition } from "../data/postiions/positions.request";
import { Position } from "../data/postiions/positions";
import { Responsible } from "../data/user/user";
import { apiSlice } from "./apiSlice";

export const positionService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPosition: builder.mutation<void, CreatePosition>({
      query: (position) => ({
        url: "/position/create",
        method: "POST",
        body: position,
      }),
    }),
    
    updatePosition: builder.mutation<void, Position>({
      query: (position) => ({
        url: "/position/update",
        method: "PUT",
        body: position,
      }),
    }),
    
    getPositionsBySiteId: builder.query<Position[], string>({
      query: (siteId) => `/position/site/${siteId}`,
      transformResponse: (response: { data: Position[] }) => response.data || [],
    }),

    getPositionUsers: builder.query<Responsible[], string>({
      query: (positionId) => `/position/${positionId}/users`,
      transformResponse: (response: { data: Responsible[] }) => response.data || [],
    }),
  }),
});

export const { 
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useGetPositionsBySiteIdQuery,
  useGetPositionUsersQuery
} = positionService;
