
import { apiSlice } from "./apiSlice"; 

export const mailService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendCardAssignment: builder.mutation<
      void,
      { userId: number; cardId: number; cardName: string }
    >({
      query: ({ userId, cardId, cardName }) => ({
        url: "/mail/send-card-assignment",
        method: "POST",
        body: { userId, cardId, cardName },
      }),
    }),
    
  }),
});

export const { useSendCardAssignmentMutation } = mailService;
