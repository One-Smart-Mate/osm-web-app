import { apiSlice } from "./apiSlice";

export const exportService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    downloadReport: builder.query({
      query: ({ siteId, filters }) => {
        let url = `export/card-data/site/${siteId}`;
        if (filters) {
          url += `?${filters}`;
        }
        return {
          url,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    // New comprehensive export endpoint for charts data
    downloadChartData: builder.query({
      query: ({ siteId, startDate, endDate, cardTypeName }) => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (cardTypeName) params.append("cardTypeName", cardTypeName);
        
        return {
          url: `export/chart-data/site/${siteId}?${params.toString()}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    // Alternative: Get all cards with comprehensive data for export
    getAllCardsForExport: builder.mutation({
      query: ({ siteId, startDate, endDate, cardTypeName }) => {
        const params = new URLSearchParams({
          siteId,
          ...(cardTypeName && cardTypeName !== "All Card Types" ? { cardTypeName } : {}),
        });
        
        let url = `card`;
        if (startDate || endDate) {
          if (startDate) params.append("startDate", startDate);
          if (endDate) params.append("endDate", endDate);
        }
        
        return `${url}?${params.toString()}`;
      },
      transformResponse: (response: { data: any[] }) => response.data,
    }),
  }),
});

export const { 
  useLazyDownloadReportQuery, 
  useLazyDownloadChartDataQuery,
  useGetAllCardsForExportMutation 
} = exportService;
