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
    getSiteResponsibles: builder.mutation<Responsible[], string>({
      query: (siteId) => `/users/all/${siteId}`,
      transformResponse: (response: { data: Responsible[] }) => response.data,
    }),
    getSiteMechanics: builder.mutation<Responsible[], string>({
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
    sendCustomNotification: builder.mutation<
      void,
      { siteId: number; userIds: number[]; title: string; description: string }
    >({
      query: (notificationData) => ({
        url: "/notifications/send-custom-notification",
        method: "POST",
        body: { ...notificationData },
      }),
    }),
    getUsersByRole: builder.mutation<
      Responsible[],
      { siteId: string; roleName: string }
    >({
      query: ({ siteId, roleName }) => `/users/site/${siteId}/role/${roleName}`,

      transformResponse: (response: {
        data: Responsible[];
        status: number;
        message: string;
      }) => {
        return response.data;
      },
    }),
    getUserPositions: builder.mutation<any[], string>({
      query: (userId) => `/users/${userId}/positions`,
      transformResponse: (response: {
        data: any[];
        status: number;
        message: string;
      }) => {
        return response.data;
      },
    }),
    logout: builder.mutation<void, { userId: number; osName: string }>({
      query: (logoutData) => ({
        url: "/users/logout",
        method: "POST",
        body: { ...logoutData },
      }),
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
  useSendCustomNotificationMutation,
  useGetUsersByRoleMutation,
  useGetUserPositionsMutation,
  useLogoutMutation,
} = userService;
