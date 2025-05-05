export interface CiltSequencesEvidence {
    id: number;
    siteId: number | null;
    positionId: number | null;
    ciltId: number | null;
    ciltExecutionsEvidencesId: number | null;
    evidenceUrl: string | null;
    createdAt: string | null;
  }
  
  export class CreateCiltSequencesEvidenceDTO {
    siteId?: number;
    positionId?: number;
    ciltId?: number;
    ciltExecutionsEvidencesId?: number;
    evidenceUrl?: string;
    createdAt: string;
  
    constructor(
      createdAt: string,
      siteId?: number,
      positionId?: number,
      ciltId?: number,
      ciltExecutionsEvidencesId?: number,
      evidenceUrl?: string
    ) {
      this.siteId = siteId;
      this.positionId = positionId;
      this.ciltId = ciltId;
      this.ciltExecutionsEvidencesId = ciltExecutionsEvidencesId;
      this.evidenceUrl = evidenceUrl;
      this.createdAt = createdAt;
    }
  }
  
  export class FilterCiltSequencesEvidenceDTO {
    ciltId?: number;
    sequenceId?: number;
    evidenceType?: string;
    status?: string;
  
    constructor(
      ciltId?: number,
      sequenceId?: number,
      evidenceType?: string,
      status?: string
    ) {
      this.ciltId = ciltId;
      this.sequenceId = sequenceId;
      this.evidenceType = evidenceType;
      this.status = status;
    }
  }
  
  export class UpdateCiltSequencesEvidenceDTO {
    id: number;
    siteId?: number;
    positionId?: number;
    ciltId?: number;
    ciltExecutionsEvidencesId?: number;
    evidenceUrl?: string;
  
    constructor(
      id: number,
      siteId?: number,
      positionId?: number,
      ciltId?: number,
      ciltExecutionsEvidencesId?: number,
      evidenceUrl?: string
    ) {
      this.id = id;
      this.siteId = siteId;
      this.positionId = positionId;
      this.ciltId = ciltId;
      this.ciltExecutionsEvidencesId = ciltExecutionsEvidencesId;
      this.evidenceUrl = evidenceUrl;
    }
  }