export class UpdateCardPriority {
  cardId: number;
  priorityId: number;
  idOfUpdatedBy: number;
  customDueDate?: string;

  constructor(cardId: number, priorityId: number, idOfUpdatedBy: number) {
    this.cardId = cardId;
    this.priorityId = priorityId;
    this.idOfUpdatedBy = idOfUpdatedBy;
  }
}

export class UpdateCardMechanic {
  cardId: number;
  mechanicId: number;
  idOfUpdatedBy: number;

  constructor(cardId: number, mechanicId: number, idOfUpdatedBy: number) {
    this.cardId = cardId;
    this.mechanicId = mechanicId;
    this.idOfUpdatedBy = idOfUpdatedBy;
  }
}


export class DiscardCardDto {
  cardId: number;
  amDiscardReasonId: number;
  discardReason?: string;
  managerId?: number;
  managerName?: string;
  cardManagerCloseDate?: string;
  commentsManagerAtCardClose?: string;

  constructor(
    cardId: number,
    amDiscardReasonId: number,
    discardReason?: string,
    managerId?: number,
    managerName?: string,
    cardManagerCloseDate?: string,
    commentsManagerAtCardClose?: string
  ) {
    this.cardId = cardId;
    this.amDiscardReasonId = amDiscardReasonId;
    this.discardReason = discardReason;
    this.managerId = managerId;
    this.managerName = managerName;
    this.cardManagerCloseDate = cardManagerCloseDate;
    this.commentsManagerAtCardClose = commentsManagerAtCardClose;
  }
}

export interface CreateCardRequest {
  siteId: number;
  cardUUID: string;
  cardCreationDate: string;
  nodeId?: number | null;
  priorityId?: number | null;
  cardTypeValue?: 'safe' | 'unsafe' | '';
  cardTypeId: number;
  preclassifierId: number;
  creatorId: number;
  comments?: string | null;
  evidences: any[];
  appSo?: string | null;
  appVersion?: string | null;
  customDueDate?: string | null;
}

export interface NodeCardItem {
  id: string;
  name: string;
  description: string;
  superiorId?: string | null;
}

export type EvidenceType =
  | 'IMCR' // Image Card Creation
  | 'IMCL' // Image Card Close
  | 'IMPS' // Image Provisional Solution
  | 'VICR' // Video Card Creation
  | 'VICL' // Video Card Close
  | 'VIPS' // Video Provisional Solution
  | 'AUCR' // Audio Card Creation
  | 'AUCL' // Audio Card Close
  | 'AUPS'; // Audio Provisional Solution

export interface Evidence {
  type: EvidenceType;
  url: string;
}

export interface UpdateDefinitiveSolutionRequest {
  cardId: number;
  userDefinitiveSolutionId: number;
  userAppDefinitiveSolutionId: number;
  comments: string;
  evidences: Evidence[];
}

export interface UpdateProvisionalSolutionRequest {
  cardId: number;
  userProvisionalSolutionId: number;
  userAppProvisionalSolutionId: number;
  comments: string;
  evidences: Evidence[];
}
