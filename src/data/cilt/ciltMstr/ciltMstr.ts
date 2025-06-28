export interface CiltMstr {
  id: number;
  siteId: number | null;
  ciltName: string | null;
  ciltDescription: string | null;
  creatorId: number | null;
  creatorName: string | null;
  reviewerId: number | null;
  reviewerName: string | null;
  approvedById: number | null;
  approvedByName: string | null;
  standardTime: number | null;
  urlImgLayout: string | null;
  order: number | null;
  status: string | null;
  dateOfLastUsed: string | null;
  ciltDueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class CreateCiltMstrDTO {
  siteId?: number;
  ciltName?: string;
  ciltDescription?: string;
  creatorId?: number;
  creatorName?: string;
  reviewerId?: number;
  reviewerName?: string;
  approvedById?: number;
  approvedByName?: string;
  standardTime?: number;
  urlImgLayout?: string;
  order?: number;
  status?: string;
  ciltDueDate?: string;
  createdAt: string;

  constructor(
    createdAt: string,
    siteId?: number,  
    ciltName?: string,
    ciltDescription?: string,
    creatorId?: number,
    creatorName?: string,
    reviewerId?: number,
    reviewerName?: string,
    approvedById?: number,
    approvedByName?: string,
    standardTime?: number,
    urlImgLayout?: string,
    order?: number,
    status?: string,
    ciltDueDate?: string,
  ) {
    this.siteId = siteId;
    this.ciltName = ciltName;
    this.ciltDescription = ciltDescription;
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.approvedById = approvedById;
    this.approvedByName = approvedByName;
    this.standardTime = standardTime;
    this.urlImgLayout = urlImgLayout;
    this.order = order;
    this.status = status;
    this.ciltDueDate = ciltDueDate;
    this.createdAt = createdAt;
  }
}

export class UpdateCiltMstrDTO {
  id: number;
  siteId?: number;
  ciltName?: string;
  ciltDescription?: string;
  creatorId?: number;
  creatorName?: string;
  reviewerId?: number;
  reviewerName?: string;
  approvedById?: number;
  approvedByName?: string;
  standardTime?: number;
  urlImgLayout?: string;
  order?: number;
  status?: string;
  dateOfLastUsed: string;
  ciltDueDate?: string;
  updatedAt: string;

  constructor(
    id: number,
    dateOfLastUsed: string,
    updatedAt: string,
    siteId?: number,
    ciltName?: string,
    ciltDescription?: string,
    creatorId?: number,
    creatorName?: string,
    reviewerId?: number,
    reviewerName?: string,
    approvedById?: number,
    approvedByName?: string,
    standardTime?: number,
    urlImgLayout?: string,
    order?: number,
    status?: string,
    ciltDueDate?: string
  ) {
    this.id = id;
    this.siteId = siteId;
    this.ciltName = ciltName;
    this.ciltDescription = ciltDescription;
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.approvedById = approvedById;
    this.approvedByName = approvedByName;
    this.standardTime = standardTime;
    this.urlImgLayout = urlImgLayout;
    this.order = order;
    this.status = status;
    this.dateOfLastUsed = dateOfLastUsed;
    this.ciltDueDate = ciltDueDate;
    this.updatedAt = updatedAt;
  }
}
