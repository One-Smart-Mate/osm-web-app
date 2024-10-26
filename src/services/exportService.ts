import { apiSlice } from "./apiSlice";

export const exportService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    downloadReport: builder.query({
      query: (siteId) => ({
        url: `export/card-data/site/${siteId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const { useLazyDownloadReportQuery } = exportService;
