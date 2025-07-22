export interface OplMstr {
  id: number;
  title: string;
  objetive: string | null;
  creatorId: number | null;
  creatorName: string | null;
  reviewerId: number | null;
  reviewerName: string | null;
  oplTypeId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  siteId: number | null;
}
  
  export class CreateOplMstrDTO {
  title: string;
  objetive?: string;
  creatorId?: number;
  creatorName?: string;
  reviewerId?: number;
  reviewerName?: string;
  oplTypeId?: number;
  createdAt: string;
  siteId: number | null;

  constructor(
    title: string,
    createdAt: string,
    siteId: number | null,
    objetive?: string,
    creatorId?: number,
    creatorName?: string,
    reviewerId?: number,
    reviewerName?: string,
    oplTypeId?: number
  ) {
    this.title = title;
    this.objetive = objetive;
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.oplTypeId = oplTypeId;
    this.createdAt = createdAt;
    this.siteId = siteId;
  }
}
  
  export class UpdateOplMstrDTO {
  id: number;
  title?: string;
  objetive?: string;
  creatorId?: number;
  creatorName?: string;
  reviewerId?: number;
  reviewerName?: string;
  oplTypeId?: number;
  updatedAt: string;
  siteId: number | null;

  constructor(
    id: number,
    updatedAt: string,
    siteId: number | null,
    title?: string,
    objetive?: string,
    creatorId?: number,
    creatorName?: string,
    reviewerId?: number,
    reviewerName?: string,
    oplTypeId?: number
  ) {
    this.id = id;
    this.title = title;
    this.objetive = objetive;
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.oplTypeId = oplTypeId;
    this.updatedAt = updatedAt;
    this.siteId = siteId;
  }
}