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
  refetchOnFocus: false, // OPTIMIZED: Disable refetch on tab focus (prevents unnecessary reloads)
  refetchOnReconnect: true, // Keep refetch when network reconnects (important for reliability)
  refetchOnMountOrArgChange: 60, // OPTIMIZED: Increased to 60 seconds (was 30) for better caching
  keepUnusedDataFor: 300, // OPTIMIZED: Default cache duration 5 minutes for all queries
});
