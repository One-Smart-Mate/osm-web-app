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
