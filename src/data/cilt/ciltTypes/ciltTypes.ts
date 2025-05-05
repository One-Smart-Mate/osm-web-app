export interface CiltType {
    id: number;
    siteId: number | null;
    name: string | null;
    status: string | null;
  }
  
  export class CreateCiltTypeDTO {
    siteId?: number;
    name?: string;
    status?: string;
  
    constructor(
      siteId?: number,
      name?: string,
      status?: string
    ) {
      this.siteId = siteId;
      this.name = name;
      this.status = status;
    }
  }
  
  export class UpdateCiltTypeDTO {
    id: number;
    siteId?: number;
    name?: string;
    status?: string;
  
    constructor(
      id: number,
      siteId?: number,
      name?: string,
      status?: string
    ) {
      this.id = id;
      this.siteId = siteId;
      this.name = name;
      this.status = status;
    }
  }