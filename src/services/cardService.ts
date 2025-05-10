import { CardDetailsInterface, CardInterface } from "../data/card/card";
import {
  UpdateCardMechanic,
  UpdateCardPriority,
} from "../data/card/card.request";
import { Note } from "../data/note";
import { apiSlice } from "./apiSlice";

export const cardService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCardsByLevel: builder.mutation<
      CardInterface[],
      { levelId: string; siteId: string }
    >({
      query: ({ levelId, siteId }) =>
        `/card/by-level/${levelId}?siteId=${siteId}`,
      transformResponse: (response: {
        data: CardInterface[];
        status: number;
        message: string;
      }) => response.data,
    }),
    getCards: builder.mutation<CardInterface[], string>({
      query: (siteId) => `/card/all/${siteId}`,
      transformResponse: (response: { data: CardInterface[] }) => response.data,
    }),
    getCardDetails: builder.mutation<CardDetailsInterface, string>({
      query: (id) => `/card/${id}`,
      transformResponse: (response: { data: CardDetailsInterface }) =>
        response.data,
    }),
    getCardDetailByUUID: builder.mutation<CardInterface, string>({
      query: (uuid) => `/card/uuid/${uuid}`,
      transformResponse: (response: { data: CardInterface }) =>
        response.data,
    }),
    getCardNotes: builder.mutation<Note[], string>({
      query: (cardId) => `/card/notes/${cardId}`,
      transformResponse: (response: { data: Note[] }) => response.data,
    }),
    getCardNotesByUUID: builder.mutation<Note[], string>({
      query: (uuid) => `/card/notes/uuid/${uuid}`,
      transformResponse: (response: { data: Note[] }) => response.data,
    }),
    updateCardPriority: builder.mutation<void, UpdateCardPriority>({
      query: (priority) => ({
        url: "/card/update/priority",
        method: "POST",
        body: { ...priority },
      }),
    }),
    updateCardMechanic: builder.mutation<void, UpdateCardMechanic>({
      query: (responsible) => ({
        url: "/card/update/mechanic",
        method: "POST",
        body: { ...responsible },
      }),
    }),
    searchCards: builder.query<
      CardInterface[],
      {
        siteId: string;
        area?: string;
        nodeName?: string;
        mechanic?: string;
        creator?: string;
        definitiveUser?: string;
        preclassifier?: string;
        cardTypeName: string;
      } | null
    >({
      query: (params) => {
        if (!params) {
          throw new Error("Invalid parameters");
        }
        const {
          siteId,
          area,
          nodeName,
          mechanic,
          creator,
          definitiveUser,
          preclassifier,
          cardTypeName,
        } = params;

        const queryParams = new URLSearchParams({
          siteId,
          cardTypeName,
          ...(area ? { area } : {}),
          ...(nodeName ? { nodeName } : {}),
          ...(preclassifier ? { preclassifier } : {}),
          ...(mechanic ? { mechanic } : {}),
          ...(creator ? { creator } : {}),
          ...(definitiveUser ? { definitiveUser } : {}),
        }).toString();

        return `card?${queryParams}`;
      },
      transformResponse: (response: { data: CardInterface[] }) => response.data,
    }),
  }),
});

export const {
  useGetCardsByLevelMutation,
  useGetCardsMutation,
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
  useUpdateCardPriorityMutation,
  useUpdateCardMechanicMutation,
  useSearchCardsQuery,
  useGetCardDetailByUUIDMutation,
  useGetCardNotesByUUIDMutation
} = cardService;
