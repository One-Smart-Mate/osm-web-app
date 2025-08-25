import { apiSlice } from "./apiSlice";
import {
  Responsible,
  UserCardInfo,
  UserTable,
  UserUpdateForm, 
} from "../data/user/user";
import {
  CreateUser,
  ResetPasswordClass,
  SendResetCode,
  SetAppTokenDTO,
  UpdateUser,
} from "../data/user/user.request";
import i18next from "i18next";
import Constants from "../utils/Constants";
import { ImportUsersResponse } from "../data/user/import.users.response";

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
      transformResponse: (response: { data: UserTable[] }) => {
        console.log("API response for getSiteUsers:", response.data);
        return response.data;
      },
    }),
    createUser: builder.mutation<void, CreateUser>({
      query: (user) => {
        // Use the user's chosen translation or default to ES if not provided
        const translation = user.translation || Constants.es;
        
        return {
          url: "/users/create",
          method: "POST",
          body: { ...user, translation },
        };
      },
    }),
    getUser: builder.mutation<UserUpdateForm, string>({
      query: (id) => `/users/user/${id}`,
      transformResponse: (response: { data: UserUpdateForm }) => response.data,
    }),
    updateUser: builder.mutation<any, UpdateUser>({
      query: (user) => ({
        url: "/users/update",
        method: "PUT",
        body: { ...user },
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    sendCodeToEmail: builder.mutation<void, string>({
      query: (email) => {
        // Get current language and convert to uppercase (ES or EN)
        // Default to 'EN' if language detection fails
        let currentLang = Constants.en;
        
        try {
          // Get language from i18next
          if (i18next.language) {
            currentLang = i18next.language.split("-")[0].toUpperCase();
            // Ensure it's only ES or EN
            currentLang = currentLang === Constants.es ? Constants.es : Constants.en;
          }
        } catch (error) {
          // Default to EN if there's an error
          currentLang = Constants.en;
        }
        
        return {
          url: "/users/send-code",
          method: "POST",
          body: { email, translation: currentLang },
        };
      },
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
    importUsers: builder.mutation<ImportUsersResponse, any>({
      query: ({ file, siteId }) => {
        const formData = new FormData();
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
      }) => response.data,
    }),
    getUserPositions: builder.mutation<any[], string>({
      query: (userId) => `/users/${userId}/positions`,
      transformResponse: (response: {
        data: any[];
        status: number;
        message: string;
      }) => response.data,
    }),
    logout: builder.mutation<void, { userId: number; osName: string }>({
      query: (logoutData) => ({
        url: "/users/logout",
        method: "POST",
        body: { ...logoutData },
      }),
    }),
    
    setAppToken: builder.mutation<void, SetAppTokenDTO>({
      query: (tokenData) => ({
        url: "/users/app-token",
        method: "POST",
        body: tokenData,
      }),
    }),
    getUsersWithPositions: builder.mutation<UserCardInfo[], string>({
      query: (userId) => `sites/${userId}/users/roles-and-positions`,
      transformResponse: (response: {
        data: UserCardInfo[];
        status: number;
        message: string;
      }) => response.data,
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
  useSetAppTokenMutation,
  useGetUsersWithPositionsMutation
} = userService;
