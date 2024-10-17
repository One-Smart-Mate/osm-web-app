import { Status } from "../data/status/status";
import { apiSlice } from "./apiSlice";

export const statusService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStatus: builder.mutation<Status[], void>({
      query: () => "/status/all",
      transformResponse: (response: { data: Status[] }) => response.data,
    }),
  }),
});


export const {useGetStatusMutation} = statusService