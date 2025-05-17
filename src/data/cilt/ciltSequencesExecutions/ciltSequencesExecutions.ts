export interface CiltSequenceExecution {
  id: number;
  siteId: number | null;
  positionId: number | null;
  ciltId: number | null;
  ciltDetailsId: number | null;
  secuenceStart: string | null;
  secuenceStop: string | null;
  duration: number | null;
  standardOk: string | null;
  initialParameter: string | null;
  evidenceAtCreation: number | null;
  finalParameter: string | null;
  evidenceAtFinal: number | null;
  stoppageReason: number | null;
  amTag: number | null;
  runSecuenceSchedule: string | null;  // NUEVO
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class CreateCiltSequencesExecutionDTO {
  siteId?: number;
  positionId?: number;
  ciltId?: number;
  ciltDetailsId?: number;
  secuenceStart?: string;
  secuenceStop?: string;
  duration?: number;
  standardOk?: string;
  initialParameter?: string;
  evidenceAtCreation?: number;
  finalParameter?: string;
  evidenceAtFinal?: number;
  stoppageReason?: number;
  amTag?: number;
  runSecuenceSchedule?: string;  // NUEVO
  createdAt: string;

  constructor(
    createdAt: string,
    siteId?: number,
    positionId?: number,
    ciltId?: number,
    ciltDetailsId?: number,
    secuenceStart?: string,
    secuenceStop?: string,
    duration?: number,
    standardOk?: string,
    initialParameter?: string,
    evidenceAtCreation?: number,
    finalParameter?: string,
    evidenceAtFinal?: number,
    stoppageReason?: number,
    amTag?: number,
    runSecuenceSchedule?: string, // NUEVO
  ) {
    this.siteId = siteId;
    this.positionId = positionId;
    this.ciltId = ciltId;
    this.ciltDetailsId = ciltDetailsId;
    this.secuenceStart = secuenceStart;
    this.secuenceStop = secuenceStop;
    this.duration = duration;
    this.standardOk = standardOk;
    this.initialParameter = initialParameter;
    this.evidenceAtCreation = evidenceAtCreation;
    this.finalParameter = finalParameter;
    this.evidenceAtFinal = evidenceAtFinal;
    this.stoppageReason = stoppageReason;
    this.amTag = amTag;
    this.runSecuenceSchedule = runSecuenceSchedule;  // NUEVO
    this.createdAt = createdAt;
  }
}

export class UpdateCiltSequencesExecutionDTO {
  id: number;
  siteId?: number;
  positionId?: number;
  ciltId?: number;
  ciltDetailsId?: number;
  secuenceStart?: string;
  secuenceStop?: string;
  duration?: number;
  standardOk?: string;
  initialParameter?: string;
  evidenceAtCreation?: number;
  finalParameter?: string;
  evidenceAtFinal?: number;
  stoppageReason?: number;
  amTag?: number;
  runSecuenceSchedule?: string;  // NUEVO
  updatedAt: string;

  constructor(
    id: number,
    updatedAt: string,
    siteId?: number,
    positionId?: number,
    ciltId?: number,
    ciltDetailsId?: number,
    secuenceStart?: string,
    secuenceStop?: string,
    duration?: number,
    standardOk?: string,
    initialParameter?: string,
    evidenceAtCreation?: number,
    finalParameter?: string,
    evidenceAtFinal?: number,
    stoppageReason?: number,
    amTag?: number,
    runSecuenceSchedule?: string, // NUEVO
  ) {
    this.id = id;
    this.siteId = siteId;
    this.positionId = positionId;
    this.ciltId = ciltId;
    this.ciltDetailsId = ciltDetailsId;
    this.secuenceStart = secuenceStart;
    this.secuenceStop = secuenceStop;
    this.duration = duration;
    this.standardOk = standardOk;
    this.initialParameter = initialParameter;
    this.evidenceAtCreation = evidenceAtCreation;
    this.finalParameter = finalParameter;
    this.evidenceAtFinal = evidenceAtFinal;
    this.stoppageReason = stoppageReason;
    this.amTag = amTag;
    this.runSecuenceSchedule = runSecuenceSchedule;  // NUEVO
    this.updatedAt = updatedAt;
  }
}
