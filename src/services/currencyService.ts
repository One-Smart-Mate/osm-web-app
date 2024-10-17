import { Currency } from "../data/currency/currency";
import { apiSlice } from "./apiSlice";

export const roleService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrencies: builder.mutation<Currency[], void>({
      query: () => `/currency/all`,
      transformResponse: (response: { data: Currency[] }) => response.data,
    }),
  }),
});

export const { useGetCurrenciesMutation } = roleService;
