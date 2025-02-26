import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000", credentials: 'same-origin' }),
  tagTypes: ["User"],
  endpoints: (_) => ({}),
});