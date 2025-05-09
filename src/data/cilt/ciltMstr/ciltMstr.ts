export interface CiltMstr {
  id: number;
  siteId: number | null;
  positionId: number | null;
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
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class CreateCiltMstrDTO {
  siteId?: number;
  positionId?: number;
  ciltName?: string;
  ciltDescription?: string;
  creatorId?: number;
  creatorName?: string;
  reviewerId?: number;
  reviewerName?: string;
  approvedById?: number;
  approvedByName?: string;
  standardTime?: number;
  learnigTime?: string;
  urlImgLayout?: string;
  order?: number;
  status?: string;
  dateOfLastUsed: string;
  createdAt: string;

  constructor(
    dateOfLastUsed: string,
    createdAt: string,
    siteId?: number,
    positionId?: number,
    ciltName?: string,
    ciltDescription?: string,
    creatorId?: number,
    creatorName?: string,
    reviewerId?: number,
    reviewerName?: string,
    approvedById?: number,
    approvedByName?: string,
    standardTime?: number,
    learnigTime?: string,
    urlImgLayout?: string,
    order?: number,
    status?: string
  ) {
    this.siteId = siteId;
    this.positionId = positionId;
    this.ciltName = ciltName;
    this.ciltDescription = ciltDescription;
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.approvedById = approvedById;
    this.approvedByName = approvedByName;
    this.standardTime = standardTime;
    this.learnigTime = learnigTime;
    this.urlImgLayout = urlImgLayout;
    this.order = order;
    this.status = status;
    this.dateOfLastUsed = dateOfLastUsed;
    this.createdAt = createdAt;
  }
}

export class UpdateCiltMstrDTO {
  id: number;
  siteId?: number;
  positionId?: number;
  ciltName?: string;
  ciltDescription?: string;
  creatorId?: number;
  creatorName?: string;
  reviewerId?: number;
  reviewerName?: string;
  approvedById?: number;
  approvedByName?: string;
  standardTime?: number;
  learnigTime?: string;
  urlImgLayout?: string;
  order?: number;
  status?: string;
  dateOfLastUsed: string;
  updatedAt: string;

  constructor(
    id: number,
    dateOfLastUsed: string,
    updatedAt: string,
    siteId?: number,
    positionId?: number,
    ciltName?: string,
    ciltDescription?: string,
    creatorId?: number,
    creatorName?: string,
    reviewerId?: number,
    reviewerName?: string,
    approvedById?: number,
    approvedByName?: string,
    standardTime?: number,
    learnigTime?: string,
    urlImgLayout?: string,
    order?: number,
    status?: string
  ) {
    this.id = id;
    this.siteId = siteId;
    this.positionId = positionId;
    this.ciltName = ciltName;
    this.ciltDescription = ciltDescription;
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.approvedById = approvedById;
    this.approvedByName = approvedByName;
    this.standardTime = standardTime;
    this.learnigTime = learnigTime;
    this.urlImgLayout = urlImgLayout;
    this.order = order;
    this.status = status;
    this.dateOfLastUsed = dateOfLastUsed;
    this.updatedAt = updatedAt;
  }
}
