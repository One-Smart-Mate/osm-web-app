import Strings from "../../utils/localizations/Strings";

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
  cardUUID: string;
  levelMachineId: string;
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
  cardDefinitiveSolutionDate: string | undefined;
  card: CardInterface;
  evidences: Evidences[];
}

  export const filterEvidences = (data: Evidences[]) => {
    const creation: Evidences[] = [];
    const provisionalSolution: Evidences[] = [];
    const definitiveSolution: Evidences[] = [];

    data.forEach((evidence) => {
      switch (evidence.evidenceType) {
        case Strings.AUCR:
        case Strings.IMCR:
        case Strings.VICR:
          creation.push(evidence);
          break;
        case Strings.AUPS:
        case Strings.IMPS:
        case Strings.VIPS:
          provisionalSolution.push(evidence);
          break;
        case Strings.AUCL:
        case Strings.IMCL:
        case Strings.VICL:
          definitiveSolution.push(evidence);
          break;
        default:
          break;
      }
    });

    return {
      creation,
      provisionalSolution,
      definitiveSolution,
    };
  };