import User from "../data/user/user";
import { LoginRequest } from "../data/user/user.request";
import { apiSlice } from "./apiSlice";

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
  }),
});

export const { useLoginMutation } = authService;
