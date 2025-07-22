// Interface for the nested ciltMstr object
export interface CiltMstr {
  id: number;
  siteId: number;
  order: number;
  ciltName: string;
  ciltDescription: string;
  ciltDueDate: string | null;
  creatorId: number;
  creatorName: string;
  reviewerId: number;
  reviewerName: string;
  approvedById: number;
  approvedByName: string;
  standardTime: number;
  status: string;
  urlImgLayout: string | null;
  dateOfLastUsed: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CiltSequenceExecution {
  id: number;
  siteId: number | null;
  siteExecutionId: number | null;
  positionId: number | null;
  ciltId: number | null;
  ciltSecuenceId: number | null;
  levelId: number | null;
  route: string | null;
  userId: number | null;
  userWhoExecutedId: number | null;
  secuenceSchedule: string | null;
  allowExecuteBefore: boolean | null;
  allowExecuteBeforeMinutes: number | null;
  toleranceBeforeMinutes: number | null;
  toleranceAfterMinutes: number | null;
  allowExecuteAfterDue: boolean | null;
  secuenceStart: string | null;
  secuenceStop: string | null;
  duration: number | null;
  realDuration: number | null;
  standardOk: string | null;
  initialParameter: string | null;
  evidenceAtCreation: boolean | null;
  finalParameter: string | null;
  evidenceAtFinal: boolean | null;
  nok: boolean | null;
  stoppageReason: boolean | null;
  machineStatus: string | null;
  machineStopped: boolean | null;
  amTagId: number | null;
  referencePoint: string | null;
  secuenceList: string | null;
  secuenceColor: string | null;
  ciltTypeId: number | null;
  ciltTypeName: string | null;
  referenceOplSopId: number | null;
  remediationOplSopId: number | null;
  toolsRequiered: string | null;
  selectableWithoutProgramming: boolean | null;
  status: string | null;
  runSecuenceSchedule: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  // Add the nested ciltMstr object
  ciltMstr?: CiltMstr;
  // Add evidences array
  evidences?: any[];
}

export class CreateCiltSequencesExecutionDTO {
  siteId?: number;
  siteExecutionId?: number;
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
  machineStatus?: string;
  amTag?: number;
  runSecuenceSchedule?: string;  // NUEVO
  createdAt: string;

  constructor(
    createdAt: string,
    siteId?: number,
    siteExecutionId?: number,
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
    machineStatus?: string,
    amTag?: number,
    runSecuenceSchedule?: string, // NUEVO
  ) {
    this.siteId = siteId;
    this.siteExecutionId = siteExecutionId;
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
    this.machineStatus = machineStatus;
    this.amTag = amTag;
    this.runSecuenceSchedule = runSecuenceSchedule;  // NUEVO
    this.createdAt = createdAt;
  }
}

export class UpdateCiltSequencesExecutionDTO {
  id: number;
  siteId?: number;
  siteExecutionId?: number;
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
  machineStatus?: string;
  amTag?: number;
  runSecuenceSchedule?: string;  // NUEVO
  updatedAt: string;

  constructor(
    id: number,
    updatedAt: string,
    siteId?: number,
    siteExecutionId?: number,
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
    machineStatus?: string,
    amTag?: number,
    runSecuenceSchedule?: string, // NUEVO
  ) {
    this.id = id;
    this.siteId = siteId;
    this.siteExecutionId = siteExecutionId;
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
    this.machineStatus = machineStatus;
    this.amTag = amTag;
    this.runSecuenceSchedule = runSecuenceSchedule;  // NUEVO
    this.updatedAt = updatedAt;
  }
}
