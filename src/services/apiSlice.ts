import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

//const API_SERVICE = "https://service-m2-development.up.railway.app"
const API_SERVICE = "https://service-m2-production.up.railway.appp"

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: API_SERVICE, credentials: 'same-origin' }),
  tagTypes: ["User"],
  endpoints: (_) => ({}),
});
