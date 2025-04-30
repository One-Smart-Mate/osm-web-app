export interface OplMstr {
    id: number;
    title: string;
    objetive: string | null;
    creatorId: number | null;
    creatorName: string | null;
    reviewerId: number | null;
    reviewerName: string | null;
    oplType: 'opl' | 'sop' | null;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
  }
  
  export class CreateOplMstrDTO {
    title: string;
    objetive?: string;
    creatorId?: number;
    creatorName?: string;
    reviewerId?: number;
    reviewerName?: string;
    oplType?: 'opl' | 'sop';
    createdAt: string;
  
    constructor(
      title: string,
      createdAt: string,
      objetive?: string,
      creatorId?: number,
      creatorName?: string,
      reviewerId?: number,
      reviewerName?: string,
      oplType?: 'opl' | 'sop'
    ) {
      this.title = title;
      this.objetive = objetive;
      this.creatorId = creatorId;
      this.creatorName = creatorName;
      this.reviewerId = reviewerId;
      this.reviewerName = reviewerName;
      this.oplType = oplType;
      this.createdAt = createdAt;
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
    oplType?: 'opl' | 'sop';
    updatedAt: string;
  
    constructor(
      id: number,
      updatedAt: string,
      title?: string,
      objetive?: string,
      creatorId?: number,
      creatorName?: string,
      reviewerId?: number,
      reviewerName?: string,
      oplType?: 'opl' | 'sop'
    ) {
      this.id = id;
      this.title = title;
      this.objetive = objetive;
      this.creatorId = creatorId;
      this.creatorName = creatorName;
      this.reviewerId = reviewerId;
      this.reviewerName = reviewerName;
      this.oplType = oplType;
      this.updatedAt = updatedAt;
    }
  }