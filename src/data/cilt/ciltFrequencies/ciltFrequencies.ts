export interface CiltFrequency {
    id: number;
    siteId: number | null;
    frecuencyCode: string | null;
    description: string | null;
    status: string | null;
  }
  
  export class CreateCiltFrequenciesDTO {
    siteId?: number;
    frecuencyCode?: string;
    description?: string;
    status?: string;
  
    constructor(
      siteId?: number,
      frecuencyCode?: string,
      description?: string,
      status?: string
    ) {
      this.siteId = siteId;
      this.frecuencyCode = frecuencyCode;
      this.description = description;
      this.status = status;
    }
  }
  
  export class UpdateCiltFrequenciesDTO {
    id: number;
    siteId?: number;
    frecuencyCode?: string;
    description?: string;
    status?: string;
  
    constructor(
      id: number,
      siteId?: number,
      frecuencyCode?: string,
      description?: string,
      status?: string
    ) {
      this.id = id;
      this.siteId = siteId;
      this.frecuencyCode = frecuencyCode;
      this.description = description;
      this.status = status;
    }
  }