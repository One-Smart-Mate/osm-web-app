export interface ImportUsersResponse {
  data: ImportUsersResponseData;
  message: string;
  status: number;
}

export interface ImportUsersResponseData {
  data: ImportUsersData;
  message: string;
}

export interface ImportUsersData {
  processedUsers: ImportUser[];
  successfullyCreated: number;
  totalProcessed: number;
}

export interface ImportUser {
  name: string;
  email: string;
  reason: string;
  registered: boolean;
}

export const validateReason = (reason: string): boolean => {
    return reason != undefined && reason != null && reason != "" && reason.length > 0;
}
