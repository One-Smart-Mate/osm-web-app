import {
  CardTypeUpdateForm,
  CardTypes,
  CardTypesCatalog,
} from "../data/cardtypes/cardTypes";
import {
  CreateCardType,
  UpdateCardTypeReq,
} from "../data/cardtypes/cardTypes.request";
import { apiSlice } from "./apiSlice";

export const cardTypesService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCardTypes: builder.mutation<CardTypes[], string>({
      query: (siteId) => `/card-types/all/${siteId}`,
      transformResponse: (response: { data: CardTypes[] }) => response.data,
    }),
    createCardType: builder.mutation<void, CreateCardType>({
      query: (cardType) => ({
        url: "/card-types/create",
        method: "POST",
        body: { ...cardType },
      }),
    }),
    getCardType: builder.mutation<CardTypeUpdateForm, string>({
      query: (id) => `/card-types/card-type/${id}`,
      transformResponse: (response: { data: CardTypeUpdateForm }) =>
        response.data,
    }),
    updateCardType: builder.mutation<void, UpdateCardTypeReq>({
      query: (cardType) => ({
        url: "/card-types/update",
        method: "PUT",
        body: { ...cardType },
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    getCardTypesCatalogs: builder.mutation<CardTypesCatalog[], void>({
      query: () => `/card-types/catalogs`,
      transformResponse: (response: { data: CardTypesCatalog[] }) =>
        response.data,
    }),
  }),
});

export const {
  useGetCardTypesMutation,
  useCreateCardTypeMutation,
  useGetCardTypeMutation,
  useUpdateCardTypeMutation,
  useGetCardTypesCatalogsMutation,
} = cardTypesService;
