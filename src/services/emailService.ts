import { apiSlice } from "./apiSlice";

export const emailService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendEmailToExternalProvider: builder.mutation<
      void,
      { email: string; cardId: number; link: string }
    >({
      query: ({ email, cardId, link }) => ({
        url: "/mail/send-external-provider",
        method: "POST",
        body: { email, cardId, link },
      }),
    }),
  }),
});

export const { useSendEmailToExternalProviderMutation } = emailService;
