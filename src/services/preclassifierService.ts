import Preclassifier from "../data/preclassifier/preclassifier";
import {
  CreatePreclassifier,
  UpdatePreclassifier,
} from "../data/preclassifier/preclassifier.request";
import { apiSlice } from "./apiSlice";

export const preclassifierService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPreclassifiers: builder.mutation<Preclassifier[], string>({
      query: (cardTypeId) => `/preclassifier/card-type/${cardTypeId}`,
      transformResponse: (response: { data: Preclassifier[] }) => response.data,
    }),
    createPreclassifier: builder.mutation<void, CreatePreclassifier>({
      query: (preclassifier) => ({
        url: "/preclassifier/create",
        method: "POST",
        body: { ...preclassifier },
      }),
    }),
    getPreclassifier: builder.mutation<Preclassifier, string>({
      query: (id) => `/preclassifier/${id}`,
      transformResponse: (response: { data: Preclassifier }) => response.data,
    }),
    updatePreclassifier: builder.mutation<void, UpdatePreclassifier>({
      query: (preclassifier) => ({
        url: "/preclassifier/update",
        method: "PUT",
        body: { ...preclassifier },
      }),
    }),
  }),
});

export const {
  useGetPreclassifiersMutation,
  useCreatePreclassifierMutation,
  useGetPreclassifierMutation,
  useUpdatePreclassifierMutation,
} = preclassifierService;
