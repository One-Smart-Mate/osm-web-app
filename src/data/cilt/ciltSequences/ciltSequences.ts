export interface CiltSequence {
    id: number;
    siteId: number | null;
    siteName: string | null;
    areaId: number | null;
    areaName: string | null;
    positionId: number | null;
    positionName: string;
    ciltMstrId: number | null;
    ciltMstrName: string | null;
    levelId: number | null;
    levelName: string | null;
    order: number | null;
    secuenceList: string | null;
    secuenceColor: string | null;
    ciltTypeId: number | null;
    ciltTypeName: string | null;
    referenceOplSop: number | null;
    standardTime: number | null;
    standardOk: string | null;
    remediationOplSop: number | null;
    toolsRequired: string | null;
    stoppageReason: number | null;
    quantityPicturesCreate: number | null;
    quantityPicturesClose: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
  }
  
  export class CreateCiltSequenceDTO {
    siteId?: number;
    siteName?: string;
    areaId?: number;
    areaName?: string;
    positionId?: number;
    positionName: string;
    ciltMstrId?: number;
    ciltMstrName?: string;
    levelId?: number;
    levelName?: string;
    order?: number;
    secuenceList?: string;
    secuenceColor?: string;
    ciltTypeId?: number;
    ciltTypeName?: string;
    referenceOplSop?: number;
    standardTime?: number;
    standardOk?: string;
    remediationOplSop?: number;
    toolsRequired?: string;
    stoppageReason?: number;
    quantityPicturesCreate?: number;
    quantityPicturesClose?: number;
    createdAt: string;
  
    constructor(
      positionName: string,
      createdAt: string,
      siteId?: number,
      siteName?: string,
      areaId?: number,
      areaName?: string,
      positionId?: number,
      ciltMstrId?: number,
      ciltMstrName?: string,
      levelId?: number,
      levelName?: string,
      order?: number,
      secuenceList?: string,
      secuenceColor?: string,
      ciltTypeId?: number,
      ciltTypeName?: string,
      referenceOplSop?: number,
      standardTime?: number,
      standardOk?: string,
      remediationOplSop?: number,
      toolsRequired?: string,
      stoppageReason?: number,
      quantityPicturesCreate?: number,
      quantityPicturesClose?: number
    ) {
      this.siteId = siteId;
      this.siteName = siteName;
      this.areaId = areaId;
      this.areaName = areaName;
      this.positionId = positionId;
      this.positionName = positionName;
      this.ciltMstrId = ciltMstrId;
      this.ciltMstrName = ciltMstrName;
      this.levelId = levelId;
      this.levelName = levelName;
      this.order = order;
      this.secuenceList = secuenceList;
      this.secuenceColor = secuenceColor;
      this.ciltTypeId = ciltTypeId;
      this.ciltTypeName = ciltTypeName;
      this.referenceOplSop = referenceOplSop;
      this.standardTime = standardTime;
      this.standardOk = standardOk;
      this.remediationOplSop = remediationOplSop;
      this.toolsRequired = toolsRequired;
      this.stoppageReason = stoppageReason;
      this.quantityPicturesCreate = quantityPicturesCreate;
      this.quantityPicturesClose = quantityPicturesClose;
      this.createdAt = createdAt;
    }
  }
  
  export class UpdateCiltSequenceDTO {
    id: number;
    siteId?: number;
    siteName?: string;
    areaId?: number;
    areaName?: string;
    positionId?: number;
    positionName?: string;
    ciltMstrId?: number;
    ciltMstrName?: string;
    levelId?: number;
    levelName?: string;
    order?: number;
    secuenceList?: string;
    secuenceColor?: string;
    ciltTypeId?: number;
    ciltTypeName?: string;
    referenceOplSop?: number;
    standardTime?: number;
    standardOk?: string;
    remediationOplSop?: number;
    toolsRequired?: string;
    stoppageReason?: number;
    quantityPicturesCreate?: number;
    quantityPicturesClose?: number;
    updatedAt: string;
  
    constructor(
      id: number,
      updatedAt: string,
      siteId?: number,
      siteName?: string,
      areaId?: number,
      areaName?: string,
      positionId?: number,
      positionName?: string,
      ciltMstrId?: number,
      ciltMstrName?: string,
      levelId?: number,
      levelName?: string,
      order?: number,
      secuenceList?: string,
      secuenceColor?: string,
      ciltTypeId?: number,
      ciltTypeName?: string,
      referenceOplSop?: number,
      standardTime?: number,
      standardOk?: string,
      remediationOplSop?: number,
      toolsRequired?: string,
      stoppageReason?: number,
      quantityPicturesCreate?: number,
      quantityPicturesClose?: number
    ) {
      this.id = id;
      this.siteId = siteId;
      this.siteName = siteName;
      this.areaId = areaId;
      this.areaName = areaName;
      this.positionId = positionId;
      this.positionName = positionName;
      this.ciltMstrId = ciltMstrId;
      this.ciltMstrName = ciltMstrName;
      this.levelId = levelId;
      this.levelName = levelName;
      this.order = order;
      this.secuenceList = secuenceList;
      this.secuenceColor = secuenceColor;
      this.ciltTypeId = ciltTypeId;
      this.ciltTypeName = ciltTypeName;
      this.referenceOplSop = referenceOplSop;
      this.standardTime = standardTime;
      this.standardOk = standardOk;
      this.remediationOplSop = remediationOplSop;
      this.toolsRequired = toolsRequired;
      this.stoppageReason = stoppageReason;
      this.quantityPicturesCreate = quantityPicturesCreate;
      this.quantityPicturesClose = quantityPicturesClose;
      this.updatedAt = updatedAt;
    }
  }
  