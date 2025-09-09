import { CardDetailsInterface, CardInterface } from "../data/card/card";
import {
  UpdateCardMechanic,
  UpdateCardPriority,
  CreateCardRequest,
} from "../data/card/card.request";
import { Note } from "../data/note";
import { apiSlice } from "./apiSlice";

// Define the response type for the new endpoint
interface FastPasswordResponse {
  user: {
    id: number;
    name: string;
    email: string;
    fastPassword?: string;
  };
  cards: CardInterface[];
}

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
      transformResponse: (response: { data: CardInterface }) => response.data,
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
        status?: string;
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
          status,
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
          ...(status ? { status } : {}),
        }).toString();

        return `card?${queryParams}`;
      },
      transformResponse: (response: { data: CardInterface[] }) => response.data,
    }),
    getDiscardedCardsByUser: builder.query<
      any[], 
      { siteId: number; startDate?: string; endDate?: string }
    >({
      query: ({ siteId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `/card/site/discarded-cards/${siteId}?${params.toString()}`;
      },
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    discardCard: builder.mutation<void, any>({
      query: (dto) => ({
        url: "/card/discard",
        method: "POST",
        body: dto,
      }),
    }),
    findCardsByFastPassword: builder.query<
      FastPasswordResponse,
      { siteId: number; fastPassword: string }
    >({
      query: ({ siteId, fastPassword }) =>
        `/card/fast-password/${siteId}/${fastPassword}`,
      transformResponse: (response: { data: FastPasswordResponse }) => response.data,
    }),
    createCard: builder.mutation<void, CreateCardRequest>({
      query: (cardData) => ({
        url: "/card/create",
        method: "POST",
        body: cardData,
      }),
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
  useGetCardNotesByUUIDMutation,
  useGetDiscardedCardsByUserQuery,
  useDiscardCardMutation,
  useFindCardsByFastPasswordQuery,
  useCreateCardMutation,
} = cardService;
