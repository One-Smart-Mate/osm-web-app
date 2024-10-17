export interface CardInterface {
  id: string;
  siteId: string;
  siteCardId: string;
  status: string;
  cardCreationDate: string;
  cardDueDate: string;
  preclassifierCode: string;
  preclassifierDescription: string;
  areaName: string;
  creatorName: string;
  cardTypeMethodologyName: string;
  cardTypeName: string;
  cardTypeColor: string;
  priorityCode: string;
  priorityDescription: string;
  commentsAtCardCreation: string;
  mechanicName: string;
  userProvisionalSolutionName: string;
  cardProvisionalSolutionDate: string;
  commentsAtCardProvisionalSolution: string;
  userDefinitiveSolutionName: string;
  cardDefinitiveSolutionDate: string;
  commentsAtCardDefinitiveSolution: string;
  evidences: Evidences[];
  createdAt: string;
  responsableName: string;
  userAppProvisionalSolutionName: string;
  userAppDefinitiveSolutionName: string;
  cardLocation: string;
}

export interface Evidences {
  id: string;
  cardId: string;
  siteId: string;
  evidenceName: string;
  evidenceType: string;
  status: string;
  createdAt: string;
}

export interface CardDetailsInterface {
  card: CardInterface;
  evidences: Evidences[];
}
