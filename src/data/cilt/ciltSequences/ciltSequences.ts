export interface CiltSequence {
  id: number;
  siteId: number | null;
  siteName: string | null;
  areaId: number | null;
  areaName: string | null;
  positionId: number | null;
  positionName: string | null;
  ciltMstrId: number | null;
  ciltMstrName: string | null;
  frecuencyId: number | null;
  frecuencyCode: string | null;
  levelId: number | null;
  levelName: string | null;
  route: string | null;
  referencePoint: string | null;
  order: number | null;
  secuenceList: string | null;
  secuenceColor: string | null;
  ciltTypeId: number | null;
  ciltTypeName: string | null;
  referenceOplSopId: number | null;
  standardTime: number | null;
  standardOk: string | null;
  remediationOplSopId: number | null;
  toolsRequired: string | null;
  stoppageReason: number | null;
  machineStopped: number | null;
  quantityPicturesCreate: number | null;
  quantityPicturesClose: number | null;
  selectableWithoutProgramming: number | null;
  status: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface CreateCiltSequenceDTO {
  siteId?: number;
  siteName?: string;
  areaId?: number;
  areaName?: string;
  positionId?: number;
  positionName?: string;
  ciltMstrId?: number;
  ciltMstrName?: string;
  frecuencyId?: number;
  frecuencyCode?: string;
  levelId?: number;
  levelName?: string;
  route?: string;
  referencePoint?: string;
  order?: number;
  secuenceList?: string;
  secuenceColor?: string;
  ciltTypeId?: number;
  ciltTypeName?: string;
  referenceOplSopId?: number;
  standardTime?: number;
  standardOk?: string;
  remediationOplSopId?: number;
  toolsRequired?: string;
  stoppageReason?: number;
  machineStopped?: number;
  quantityPicturesCreate?: number;
  quantityPicturesClose?: number;
  selectableWithoutProgramming?: number;
  status?: string;
  createdAt: string;
}


export interface UpdateCiltSequenceDTO {
  id: number;
  siteId?: number;
  siteName?: string;
  areaId?: number;
  areaName?: string;
  positionId?: number;
  positionName?: string;
  ciltMstrId?: number;
  ciltMstrName?: string;
  frecuencyId?: number;
  frecuencyCode?: string;
  levelId?: number;
  levelName?: string;
  route?: string;
  referencePoint?: string;
  order?: number;
  secuenceList?: string;
  secuenceColor?: string;
  ciltTypeId?: number;
  ciltTypeName?: string;
  referenceOplSopId?: number;
  standardTime?: number;
  standardOk?: string;
  remediationOplSopId?: number;
  toolsRequired?: string;
  stoppageReason?: number;
  machineStopped?: number;
  quantityPicturesCreate?: number;
  quantityPicturesClose?: number;
  selectableWithoutProgramming?: number;
  status?: string;
  updatedAt: string;
}

