import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_SERVICE, credentials: 'same-origin' }),
  tagTypes: ["User"],
  endpoints: (_) => ({}),
});
