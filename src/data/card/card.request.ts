export class UpdateCardPriority {
  cardId: number;
  priorityId: number;
  customDueDate?: string;

  constructor(cardId: number, priorityId: number) {
    this.cardId = cardId;
    this.priorityId = priorityId;
  }
}

export class UpdateCardMechanic {
  cardId: number;
  mechanicId: number;

  constructor(cardId: number, mechanicId: number) {
    this.cardId = cardId;
    this.mechanicId = mechanicId;
  }
}


export class DiscardCardDto {
  cardId: number;
  amDiscardReasonId: number;
  discardReason?: string;
  commentsManagerAtCardClose?: string;

  constructor(
    cardId: number,
    amDiscardReasonId: number,
    discardReason?: string,
    commentsManagerAtCardClose?: string
  ) {
    this.cardId = cardId;
    this.amDiscardReasonId = amDiscardReasonId;
    this.discardReason = discardReason;
    this.commentsManagerAtCardClose = commentsManagerAtCardClose;
  }
}

export interface CreateCardRequest {
  siteId: number;
  cardUUID: string;
  cardCreationDate: string;
  nodeId: number;
  priorityId: number;
  cardTypeValue?: 'safe' | 'unsafe' | '';
  cardTypeId: number;
  preclassifierId: number;
  comments?: string | null;
  evidences: any[];
  appSo?: string | null;
  appVersion?: string | null;
  customDueDate?: string | null;
  notifyResponsible?: boolean;
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
  comments: string;
  evidences: Evidence[];
}

export interface UpdateProvisionalSolutionRequest {
  cardId: number;
  userProvisionalSolutionId: number;
  comments: string;
  evidences: Evidence[];
}
