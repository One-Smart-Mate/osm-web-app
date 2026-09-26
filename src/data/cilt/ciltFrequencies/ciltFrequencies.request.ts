  export class CreateCiltFrequencies {
    siteId?: number;
    frecuencyCode?: string;
    description?: string;
    status?: string;
    createdAt: string;
  
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
      this.createdAt = new Date().toISOString();
    }
  }
  
  export class UpdateCiltFrequencies {
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
