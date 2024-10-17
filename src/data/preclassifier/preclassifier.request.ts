export class CreatePreclassifier {
  preclassifierCode: string;
  preclassifierDescription: string;
  cardTypeId: number;

  constructor(
    preclassifierCode: string,
    preclassifierDescription: string,
    cardTypeId: number
  ) {
    this.preclassifierCode = preclassifierCode;
    this.preclassifierDescription = preclassifierDescription;
    this.cardTypeId = cardTypeId;
  }
}

export class UpdatePreclassifier {
  id: number;
  preclassifierCode: string;
  preclassifierDescription: string;
  status: string;

  constructor(
    id: number,
    preclassifierCode: string,
    preclassifierDescription: string,
    status: string
  ) {
    this.preclassifierCode = preclassifierCode;
    this.preclassifierDescription = preclassifierDescription;
    this.id = id;
    this.status = status;
  }
}
