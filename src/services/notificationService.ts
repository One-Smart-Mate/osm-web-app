import { NotificationRequest } from "../data/notification/notification.request";
import { apiSlice } from "./apiSlice";

export const notificationService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendNotification: builder.mutation<void, NotificationRequest>({
      query: (notification) => ({
        url: "/notifications/send-custom-notification",
        method: "POST",
        body: notification,
      }),
    }),
  }),
});

export const { useSendNotificationMutation } = notificationService;
