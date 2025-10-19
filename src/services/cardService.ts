import { CardDetailsInterface, CardInterface } from "../data/card/card";
import {
  UpdateCardMechanic,
  UpdateCardPriority,
  CreateCardRequest,
  UpdateDefinitiveSolutionRequest,
  UpdateProvisionalSolutionRequest,
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

// Paginated cards response interface
interface PaginatedCardsResponse {
  data: CardInterface[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Filters for paginated query
interface CardFilters {
  searchText?: string;
  cardNumber?: string;
  location?: string;
  creator?: string;
  resolver?: string;
  dateFilterType?: 'creation' | 'due' | '';
  startDate?: string;
  endDate?: string;
  sortOption?: 'dueDate-asc' | 'dueDate-desc' | 'creationDate-asc' | 'creationDate-desc' | '';
  status?: string;
  levelMachineId?: string;
  userId?: number;
  myCards?: boolean;
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
    getCardsPaginated: builder.mutation<
      PaginatedCardsResponse,
      { siteId: string; page: number; limit: number; filters?: CardFilters }
    >({
      query: ({ siteId, page, limit, filters = {} }) => {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filters.searchText ? { searchText: filters.searchText } : {}),
          ...(filters.cardNumber ? { cardNumber: filters.cardNumber } : {}),
          ...(filters.location ? { location: filters.location } : {}),
          ...(filters.creator ? { creator: filters.creator } : {}),
          ...(filters.resolver ? { resolver: filters.resolver } : {}),
          ...(filters.dateFilterType ? { dateFilterType: filters.dateFilterType } : {}),
          ...(filters.startDate ? { startDate: filters.startDate } : {}),
          ...(filters.endDate ? { endDate: filters.endDate } : {}),
          ...(filters.sortOption ? { sortOption: filters.sortOption } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.levelMachineId ? { levelMachineId: filters.levelMachineId } : {}),
          ...(filters.userId ? { userId: filters.userId.toString() } : {}),
          ...(filters.myCards !== undefined ? { myCards: filters.myCards.toString() } : {}),
        }).toString();

        return `/card/all/${siteId}/paginated?${queryParams}`;
      },
      transformResponse: (response: { data: PaginatedCardsResponse }) => response.data,
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
    updateCardCustomDueDate: builder.mutation<void, { cardId: number; customDueDate: string; idOfUpdatedBy: number }>({
      query: (body) => ({
        url: "/card/update/custom-due-date",
        method: "POST",
        body,
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
    createCard: builder.mutation<CardInterface, CreateCardRequest>({
      query: (cardData) => ({
        url: "/card/create",
        method: "POST",
        body: cardData,
      }),
      transformResponse: (response: { data: CardInterface }) => response.data,
    }),
    updateDefinitiveSolution: builder.mutation<CardInterface, UpdateDefinitiveSolutionRequest>({
      query: (solutionData) => ({
        url: "/card/update/definitive-solution",
        method: "PUT",
        body: solutionData,
      }),
      transformResponse: (response: { data: CardInterface }) => response.data,
    }),
    updateProvisionalSolution: builder.mutation<CardInterface, UpdateProvisionalSolutionRequest>({
      query: (solutionData) => ({
        url: "/card/update/provisional-solution",
        method: "PUT",
        body: solutionData,
      }),
      transformResponse: (response: { data: CardInterface }) => response.data,
    }),
    // Card Reports - Advanced Analytics
    getCardReportGrouped: builder.mutation<
      Array<{
        grouping_id: number;
        level_name: string;
        total_cards: number;
      }>,
      {
        siteId: number;
        rootNode: number;
        targetLevel: number;
        groupingLevel: number;
        dateStart: string;
        dateEnd: string;
      }
    >({
      query: (params) => ({
        url: "/card/report/grouped",
        method: "POST",
        body: params,
      }),
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    getCardReportDetails: builder.mutation<
      Array<{
        machine_id: number;
        maquina: string;
        comp_id: number;
        comp_name: string;
        n_cards: number;
      }>,
      {
        siteId: number;
        rootId: number;
        targetLevel: number;
        dateStart: string;
        dateEnd: string;
      }
    >({
      query: (params) => ({
        url: "/card/report/details",
        method: "POST",
        body: params,
      }),
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    getCardsByMachine: builder.mutation<
      CardInterface[],
      {
        siteId: number;
        machineId: number;
        targetLevel: number;
        dateStart: string;
        dateEnd: string;
      }
    >({
      query: (params) => ({
        url: "/card/report/by-machine",
        method: "POST",
        body: params,
      }),
      transformResponse: (response: { data: CardInterface[] }) => response.data,
    }),
    getCardsByComponents: builder.mutation<
      CardInterface[],
      {
        siteId: number;
        componentIds: number[];
        dateStart: string;
        dateEnd: string;
      }
    >({
      query: (params) => ({
        url: "/card/report/by-components",
        method: "POST",
        body: params,
      }),
      transformResponse: (response: { data: CardInterface[] }) => response.data,
    }),
  }),
});

export const {
  useGetCardsByLevelMutation,
  useGetCardsMutation,
  useGetCardsPaginatedMutation,
  useGetCardDetailsMutation,
  useGetCardNotesMutation,
  useUpdateCardPriorityMutation,
  useUpdateCardMechanicMutation,
  useUpdateCardCustomDueDateMutation,
  useSearchCardsQuery,
  useGetCardDetailByUUIDMutation,
  useGetCardNotesByUUIDMutation,
  useGetDiscardedCardsByUserQuery,
  useDiscardCardMutation,
  useFindCardsByFastPasswordQuery,
  useCreateCardMutation,
  useUpdateDefinitiveSolutionMutation,
  useUpdateProvisionalSolutionMutation,
  useGetCardReportGroupedMutation,
  useGetCardReportDetailsMutation,
  useGetCardsByMachineMutation,
  useGetCardsByComponentsMutation,
} = cardService;
