export class CreateOplType {
  siteId: number;
  documentType: string;
  status?: string;
  createdAt: string;

  constructor(siteId: number, documentType: string, status: string = 'A', createdAt: string = new Date().toISOString()) {
    this.siteId = siteId;
    this.documentType = documentType;
    this.status = status;
    this.createdAt = createdAt;
  }
}

export class UpdateOplType {
  id: number;
  siteId: number;
  documentType: string;
  status?: string;
  updatedAt: string;

  constructor(id: number, siteId: number, documentType: string, status?: string, updatedAt: string = new Date().toISOString()) {
    this.id = Number(id); // Ensure it's definitely a number
    this.siteId = siteId;
    this.documentType = documentType;
    this.status = status;
    this.updatedAt = updatedAt;
  }
} 