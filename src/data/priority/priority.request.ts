export class CreatePriority {
  siteId: number;
  priorityCode: string;
  priorityDescription: string;
  priorityDays: number;
  constructor(
    siteId: number,
    priorityCode: string,
    priorityDescription: string,
    priorityDays: number
  ) {
    this.siteId = siteId;
    this.priorityCode = priorityCode;
    this.priorityDescription = priorityDescription;
    this.priorityDays = priorityDays;
  }
}

export class UpdatePriorityReq {
  id: number;
  priorityCode: string;
  priorityDescription: string;
  priorityDays: number;
  status: string
  constructor(
    id: number,
    priorityCode: string,
    priorityDescription: string,
    priorityDays: number,
    status: string 
  ) {
    this.id = id;
    this.priorityCode = priorityCode;
    this.priorityDescription = priorityDescription;
    this.priorityDays = priorityDays;
    this.status = status
  }
}