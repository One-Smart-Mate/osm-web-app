export class CreateLevel {
  name: string;
  description: string;
  responsibleId: number;
  levelMachineId: string;
  notify: number;
  siteId: number;
  assignWhileCreate?: number;
  constructor(
    name: string,
    description: string,
    responsibleId: number,
    siteId: number,
    levelMachineId: string,
    notify: number,
    assignWhileCreate?: number
  ) {
    this.name = name;
    this.description = description;
    this.responsibleId = responsibleId;
    this.siteId = siteId;
    this.levelMachineId = levelMachineId;
    this.notify = notify;
    this.assignWhileCreate = assignWhileCreate;
  }
}

export class CreateNode {
  name: string;
  description: string;
  responsibleId: number;
  siteId: number;
  superiorId: number;
  levelMachineId: string;
  notify: number;
  assignWhileCreate?: number;
  constructor(
    name: string,
    description: string,
    responsibleId: number,
    siteId: number,
    superiorId: number,
    levelMachineId: string,
    notify: number,
    assignWhileCreate?: number
  ) {
    this.name = name;
    this.description = description;
    this.responsibleId = responsibleId;
    this.siteId = siteId;
    this.superiorId = superiorId;
    this.levelMachineId = levelMachineId;
    this.notify = notify;
    this.assignWhileCreate = assignWhileCreate;
  }
}

export class UpdateLevel {
  id: number;
  name: string;
  description: string;
  responsibleId: number;
  status: string;
  levelMachineId: string;
  notify: number;
  assignWhileCreate?: number;
  constructor(
    id: number,
    name: string,
    description: string,
    responsibleId: number,
    status: string,
    levelMachineId: string,
    notify: number,
    assignWhileCreate?: number
  ) {
    this.name = name;
    this.description = description;
    this.responsibleId = responsibleId;
    this.id = id;
    this.status = status;
    this.levelMachineId = levelMachineId;
    this.notify = notify;
    this.assignWhileCreate = assignWhileCreate;
  }
}

export class MoveLevelDto {
  constructor(
    public levelId: number,
    public newSuperiorId: number,
  ) {
    console.log(`MoveLevelDto created with levelId: ${levelId}, newSuperiorId: ${newSuperiorId}`);
  }
}
