import { Responsible, UserTable, UserUpdateForm } from "../data/user/user";
import {
  CreateUser,
  ResetPasswordClass,
  SendResetCode,
  UpdateUser,
} from "../data/user/user.request";
import { apiSlice } from "./apiSlice";

export const userService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.mutation<UserTable[], void>({
      query: () => `/users/all`,
      transformResponse: (response: { data: UserTable[] }) => response.data,
    }),
    getSiteResponsibles: builder.mutation<Responsible[], void>({
      query: (siteId) => `/users/all/${siteId}`,
      transformResponse: (response: { data: Responsible[] }) => response.data,
    }),
    getSiteMechanics: builder.mutation<Responsible[], void>({
      query: (siteId) => `/users/site/mechanics/${siteId}`,
      transformResponse: (response: { data: Responsible[] }) => response.data,
    }),
    getSiteUsers: builder.mutation<UserTable[], string>({
      query: (siteId) => `/users/site/${siteId}`,
      transformResponse: (response: { data: UserTable[] }) => response.data,
    }),
    createUser: builder.mutation<void, CreateUser>({
      query: (user) => ({
        url: "/users/create",
        method: "POST",
        body: { ...user },
      }),
    }),
    getUser: builder.mutation<UserUpdateForm, string>({
      query: (id) => `/users/user/${id}`,
      transformResponse: (response: { data: UserUpdateForm }) => response.data,
    }),
    updateUser: builder.mutation<void, UpdateUser>({
      query: (user) => ({
        url: "/users/update",
        method: "PUT",
        body: { ...user },
      }),
    }),
    sendCodeToEmail: builder.mutation<void, string>({
      query: (email) => ({
        url: "/users/send-code",
        method: "POST",
        body: { email },
      }),
    }),
    sendCodeToVerify: builder.mutation<void, SendResetCode>({
      query: (sendResetCode) => ({
        url: "/users/verify-code",
        method: "POST",
        body: { ...sendResetCode },
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    resetPassword: builder.mutation<void, ResetPasswordClass>({
      query: (resetPassword) => ({
        url: "/users/reset-password",
        method: "POST",
        body: { ...resetPassword },
      }),
    }),
    importUsers: builder.mutation({
      query: ({ file, siteId }) => {
        var formData = new FormData();
        formData.append("file", file);
        formData.append("siteId", siteId);

        return {
          url: "/file-upload/import-users",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetUsersMutation,
  useGetSiteResponsiblesMutation,
  useGetSiteMechanicsMutation,
  useCreateUserMutation,
  useGetUserMutation,
  useUpdateUserMutation,
  useSendCodeToEmailMutation,
  useSendCodeToVerifyMutation,
  useResetPasswordMutation,
  useGetSiteUsersMutation,
  useImportUsersMutation,
} = userService;
