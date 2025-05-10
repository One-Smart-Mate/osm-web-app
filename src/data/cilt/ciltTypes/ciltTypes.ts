export interface CiltType {
  id: number;
  siteId: number | null;
  name: string | null;
  status: string | null;
  color: string | null; 
}

export class CreateCiltTypeDTO {
  siteId?: number;
  name?: string;
  status?: string;
  color?: string;

  constructor(
    siteId?: number,
    name?: string,
    status?: string,
    color?: string
  ) {
    this.siteId = siteId;
    this.name = name;
    this.status = status;
    this.color = color; 
  }
}

export class UpdateCiltTypeDTO {
  id: number;
  siteId?: number;
  name?: string;
  status?: string;
  color?: string;

  constructor(
    id: number,
    siteId?: number,
    name?: string,
    status?: string,
    color?: string
  ) {
    this.id = id;
    this.siteId = siteId;
    this.name = name;
    this.status = status;
    this.color = color;
  }
}
