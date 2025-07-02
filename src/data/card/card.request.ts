export class UpdateCardPriority {
  cardId: number;
  priorityId: number;
  idOfUpdatedBy: number;

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
