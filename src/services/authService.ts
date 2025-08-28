import User from "../data/user/user";
import { LoginRequest } from "../data/user/user.request";
import { apiSlice } from "./apiSlice";

// DTO for updating last login/activity
export interface UpdateLastLoginDTO {
  userId: number;
  date: Date | string; // Backend expects Date but we send as ISO string
  platform: string;
  timezone?: string;
}

// DTO for fast login with fast password
export interface FastLoginDTO {
  fastPassword: string;
  platform: string;
  timezone?: string;
}

export const authService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<User, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: { ...credentials },
      }),
      transformResponse: (response: { data: User }, _, __) => response.data,
      invalidatesTags: ["User"],
    }),
    fastLogin: builder.mutation<User, FastLoginDTO>({
      query: (credentials) => ({
        url: "/auth/login-fast",
        method: "POST",
        body: { ...credentials },
      }),
      transformResponse: (response: { data: User }, _, __) => response.data,
      invalidatesTags: ["User"],
    }),
    updateLastLogin: builder.mutation<any, UpdateLastLoginDTO>({
      query: (data) => ({
        url: "/auth/update-last-login",
        method: "POST",
        body: data, // Send data as-is since we're already sending ISO strings
      }),
      transformResponse: (response: { data: any }, _, __) => response.data,
    }),
  }),
});

export const { useLoginMutation, useFastLoginMutation, useUpdateLastLoginMutation } = authService;
