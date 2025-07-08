import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "../utils/Constants";
import User from "../data/user/user";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_SERVICE, 
    credentials: 'same-origin',
    prepareHeaders: (headers) => {
      let token="";
      const user = sessionStorage.getItem(Constants.SESSION_KEYS.user);
      if (user) {
        token = (JSON.parse(user) as User).token;
      }
      headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
   }),
  tagTypes: ["User", "OplLevel"],
  endpoints: (_) => ({}),
  refetchOnFocus: true, // Refetch data when the app regains focus
  refetchOnReconnect: true, 
});
