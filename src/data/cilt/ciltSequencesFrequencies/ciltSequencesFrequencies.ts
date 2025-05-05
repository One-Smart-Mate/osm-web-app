export interface CiltSequenceFrequency {
    id: number;
    siteId: number | null;
    positionId: number | null;
    ciltId: number | null;
    secuencyId: number | null;
    frecuencyId: number | null;
    frecuencyCode: string | null;
    status: string | null;
  }
  
  export class CreateCiltSequencesFrequenciesDTO {
    siteId?: number;
    positionId?: number;
    ciltId?: number;
    secuencyId?: number;
    frecuencyId?: number;
    frecuencyCode?: string;
    status?: string;
  
    constructor(
      siteId?: number,
      positionId?: number,
      ciltId?: number,
      secuencyId?: number,
      frecuencyId?: number,
      frecuencyCode?: string,
      status?: string
    ) {
      this.siteId = siteId;
      this.positionId = positionId;
      this.ciltId = ciltId;
      this.secuencyId = secuencyId;
      this.frecuencyId = frecuencyId;
      this.frecuencyCode = frecuencyCode;
      this.status = status;
    }
  }
  
  export class UpdateCiltSequencesFrequenciesDTO {
    id: number;
    siteId?: number;
    positionId?: number;
    ciltId?: number;
    secuencyId?: number;
    frecuencyId?: number;
    frecuencyCode?: string;
    status?: string;
  
    constructor(
      id: number,
      siteId?: number,
      positionId?: number,
      ciltId?: number,
      secuencyId?: number,
      frecuencyId?: number,
      frecuencyCode?: string,
      status?: string
    ) {
      this.id = id;
      this.siteId = siteId;
      this.positionId = positionId;
      this.ciltId = ciltId;
      this.secuencyId = secuencyId;
      this.frecuencyId = frecuencyId;
      this.frecuencyCode = frecuencyCode;
      this.status = status;
    }
  }