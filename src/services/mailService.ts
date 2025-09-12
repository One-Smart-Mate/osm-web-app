import { apiSlice } from "./apiSlice"; 
import i18next from "i18next";
import Constants from "../utils/Constants";

export const mailService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendCardAssignment: builder.mutation<
      void,
      { userId: number; cardId: number; cardName: string }
    >({
      query: ({ userId, cardId, cardName }) => {
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
        } catch (_error) {
          // Default to EN if there's an error
          currentLang = Constants.en;
        }
        
        return {
          url: "/mail/send-card-assignment",
          method: "POST",
          body: { userId, cardId, cardName, translation: currentLang },
        };
      },
    }),
    
  }),
});

export const { useSendCardAssignmentMutation } = mailService;
