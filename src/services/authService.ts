import User from "../data/user/user";
import { LoginRequest } from "../data/user/user.request";
import { apiSlice } from "./apiSlice";

// DTO for updating last login/activity
export interface UpdateLastLoginDTO {
  userId: number;
  date: string;
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
    updateLastLogin: builder.mutation<any, UpdateLastLoginDTO>({
      query: (data) => ({
        url: "/auth/update-last-login",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: any }, _, __) => response.data,
    }),
  }),
});

export const { useLoginMutation, useUpdateLastLoginMutation } = authService;
