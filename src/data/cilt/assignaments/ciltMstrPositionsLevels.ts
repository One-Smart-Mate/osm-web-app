export interface CiltMstrPositionLevel {
    id: number;
    siteId: number;
    ciltMstrId: number;
    positionId: number;
    levelId: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
  }
  
  export class CreateCiltMstrPositionLevelDTO {
    siteId: number;
    ciltMstrId: number;
    positionId: number;
    levelId: number;
    status?: string;
    createdAt?: string;
  
    constructor(siteId: number, ciltMstrId: number, positionId: number, levelId: number, status: string = 'A', createdAt?: string) {
      this.siteId = siteId;
      this.ciltMstrId = ciltMstrId;
      this.positionId = positionId;
      this.levelId = levelId;
      this.status = status;
      this.createdAt = createdAt || new Date().toISOString();
    }
  }
  
  export class UpdateCiltMstrPositionLevelDTO {
    id: number;
    siteId: number;
    ciltMstrId: number;
    positionId: number;
    levelId: number;
    status?: string;
  
    constructor(
      id: number,
      siteId: number,
      ciltMstrId: number,
      positionId: number,
      levelId: number,
      status: string = 'A'
    ) {
      this.id = id;
      this.siteId = siteId;
      this.ciltMstrId = ciltMstrId;
      this.positionId = positionId;
      this.levelId = levelId;
      this.status = status;
    }
  }
  