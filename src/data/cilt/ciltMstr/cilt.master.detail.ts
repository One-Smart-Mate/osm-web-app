import { CiltSequence } from "../ciltSequences/ciltSequences";

export interface CiltDetailsResponse {
  data: CiltDetails;
  status: number;
  message: string;
}

export interface CiltDetails {
    ciltInfo: CiltDetailInfo;
    sequences: CiltSequence[];
}

export interface CiltDetailInfo {
  id: number;
  siteId: number;
  positionId: number;
  ciltName: string;
  ciltDescription: string;
  creatorId: number;
  creatorName: string;
  reviewerId: number;
  reviewerName: string;
  approvedById: number;
  approvedByName: string;
  standardTime: number;
  learnigTime: string;
  urlImgLayout: string;
  order: number;
  status: string;
  dateOfLastUsed: string;
  ciltDueDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
