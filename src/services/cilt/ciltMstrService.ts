import { apiSlice } from "../apiSlice";
import { CiltMstr } from "../../data/cilt/ciltMstr/ciltMstr";
import {
  CreateCiltMstrDTO,
  UpdateCiltMstrDTO,
} from "../../data/cilt/ciltMstr/ciltMstr";
import { CiltDetails, CiltDetailsResponse } from "../../data/cilt/ciltMstr/cilt.master.detail";
import { notification } from "antd";
import Strings from "../../utils/localizations/Strings";

export const ciltMstrService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCiltMstrAll: builder.mutation<CiltMstr[], void>({
      query: () => `/cilt-mstr/all`,
      transformResponse: (response: { data: CiltMstr[] }) => response.data,
    }),
    getCiltMstrBySite: builder.query<CiltMstr[], string>({
      query: (siteId) => `/cilt-mstr/site/${siteId}`,
      transformResponse: (response: { data: CiltMstr[] }) => response.data,
    }),
    getCiltMstrByPosition: builder.mutation<CiltMstr[], string>({
      query: (positionId) => `/cilt-mstr/position/${positionId}`,
      transformResponse: (response: { data: CiltMstr[] }) => response.data,
    }),
    getCiltMstrById: builder.mutation<CiltMstr, string>({
      query: (id) => `/cilt-mstr/${id}`,
      transformResponse: (response: { data: CiltMstr }) => response.data,
    }),
    createCiltMstr: builder.mutation<CiltMstr, CreateCiltMstrDTO>({
      query: (newCilt) => ({
        url: `/cilt-mstr/create`,
        method: "POST",
        body: { ...newCilt },
      }),
      transformResponse: (response: { data: CiltMstr }) => response.data,
    }),
    updateCiltMstr: builder.mutation<CiltMstr, UpdateCiltMstrDTO>({
      query: (cilt) => ({
        url: `/cilt-mstr/update`,
        method: "PUT",
        body: { ...cilt },
      }),
      transformResponse: (response: { data: CiltMstr }) => response.data,
    }),
    getCiltDetails: builder.mutation<CiltDetails, string>({
      query: (ciltId) => `/cilt-mstr/details/${ciltId}`,
      transformResponse: (response: CiltDetailsResponse) => response.data,
    }),
    cloneCiltMstr: builder.mutation<CiltMstr, string>({
      query: (id) => ({
        url: `/cilt-mstr/clone/${id}`,
        method: "POST",
      }),
      transformResponse: (response: { data: CiltMstr }) => response.data,
    }),
    deleteCiltMstr: builder.mutation<void, string>({
      query: (id) => ({
        url: `/cilt-mstr/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetCiltMstrAllMutation,
  useGetCiltMstrBySiteQuery, // Changed from Mutation to Query
  useGetCiltMstrByPositionMutation,
  useGetCiltMstrByIdMutation,
  useCreateCiltMstrMutation,
  useUpdateCiltMstrMutation,
  useGetCiltDetailsMutation,
  useCloneCiltMstrMutation,
  useDeleteCiltMstrMutation
} = ciltMstrService;

/**
 * Custom hook for cloning a CILT master with its sequences using backend endpoint
 */
export const useCiltCloning = () => {
  const [cloneCiltMstrApi] = useCloneCiltMstrMutation();

  /**
   * Clone a CILT master with its sequences using the backend endpoint
   * @param cilt The CILT master to clone
   * @returns Promise<boolean> Indicates if the operation was successful
   */
  const cloneCilt = async (cilt: CiltMstr): Promise<boolean> => {
    try {
      // Call the backend endpoint to clone the CILT master with its sequences
      await cloneCiltMstrApi(cilt.id.toString()).unwrap();

      // Show success notification
      notification.success({
        message: Strings.success,
        description: Strings.ciltCloneSuccess,
      });

      return true;
    } catch (error: any) {
      console.error("Error cloning CILT:", error);
      
      // Extract meaningful error message
      let errorMessage = Strings.ciltCloneError;
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      notification.error({
        message: Strings.error,
        description: errorMessage,
      });
      return false;
    }
  };

  return { cloneCilt };
};
