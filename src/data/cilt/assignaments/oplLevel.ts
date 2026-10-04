export interface OplLevel {
    id: number;
    oplId: number;
    levelId: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
  }
  
  export class CreateOplLevelDTO {
    oplId: number;
    levelId: number;
    siteId?: number;

    constructor(oplId: number, levelId: number, siteId?: number) {
      this.oplId = oplId;
      this.levelId = levelId;
      this.siteId = siteId;
    }
  }
  
  export class UpdateOplLevelDTO {
    id: number;
    oplId: number;
    levelId: number;
    updatedAt: string;
  
    constructor(id: number, oplId: number, levelId: number, updatedAt: string) {
      this.id = id;
      this.oplId = oplId;
      this.levelId = levelId;
      this.updatedAt = updatedAt;
    }
  }
  