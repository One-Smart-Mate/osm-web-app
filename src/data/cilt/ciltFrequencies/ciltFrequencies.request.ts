  export class CreateCiltFrequencies {
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