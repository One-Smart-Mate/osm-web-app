export type OplTrainingStatus =
  | "PENDING"
  | "SELF_COMPLETED"
  | "VALIDATED"
  | "EXPIRED";

export interface OplTrainingRecord {
  id: number;
  oplId: number;
  userId?: number;
  positionId?: number | null;
  status: OplTrainingStatus;
  selfCompletedAt?: string | null;
  validatedAt?: string | null;
  validatedBy?: number | null;
  expiresAt?: string | null;
  opl?: {
    id: number;
    title: string;
    objetive?: string | null;
  } | null;
}

export interface OplTrainingMatrixUser {
  id: number;
  name: string;
  email: string;
}

export interface OplTrainingMatrixOpl {
  id: number;
  title: string;
  validityDays?: number | null;
}

export interface OplTrainingMatrix {
  users: OplTrainingMatrixUser[];
  opls: OplTrainingMatrixOpl[];
  records: OplTrainingRecord[];
}

export interface OplPositionAssignment {
  id: number;
  oplId: number;
  positionId: number;
  siteId?: number | null;
  position?: {
    id: number;
    name: string | null;
    route?: string | null;
  } | null;
}

export class AssignOplToPositionDTO {
  oplId: number;
  positionId: number;

  constructor(oplId: number, positionId: number) {
    this.oplId = oplId;
    this.positionId = positionId;
  }
}
