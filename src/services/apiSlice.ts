import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import Constants from "../utils/Constants";
import User from "../data/user/user";

// Create a custom base query with retry logic
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_SERVICE,
  credentials: 'same-origin',
  prepareHeaders: (headers) => {
    let token = "";
    const user = sessionStorage.getItem(Constants.SESSION_KEYS.user);
    if (user) {
      token = (JSON.parse(user) as User).token;
    }
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Wrap the base query with retry logic
// This will automatically retry failed requests up to 3 times with exponential backoff
const baseQueryWithRetry = retry(baseQuery, {
  maxRetries: 3,
});

export const apiSlice = createApi({
  baseQuery: baseQueryWithRetry,
  tagTypes: ["User", "OplLevel"],
  endpoints: (_) => ({}),
  refetchOnFocus: true, // Refetch data when the app regains focus
  refetchOnReconnect: true, // Refetch when network reconnects
  refetchOnMountOrArgChange: 30, // Refetch stale data (older than 30 seconds) on component mount
});
