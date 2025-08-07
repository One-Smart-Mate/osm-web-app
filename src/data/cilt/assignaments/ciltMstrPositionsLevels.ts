import { CiltMstr } from "../ciltMstr/ciltMstr";
import { Position } from "../../postiions/positions";

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

  // Extended interface for API responses that include relations
  export interface CiltMstrPositionLevelWithRelations extends CiltMstrPositionLevel {
    ciltMstr?: CiltMstr & {
      sequences?: any[]; // CiltSequence[] - avoiding circular dependency
    };
    position?: Position;
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
  