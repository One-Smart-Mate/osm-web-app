export class CreateOplType {
  documentType: string;
  status?: string;
  createdAt: string;

  constructor(documentType: string, status: string = 'A', createdAt: string = new Date().toISOString()) {
    this.documentType = documentType;
    this.status = status;
    this.createdAt = createdAt;
  }
}

export class UpdateOplType {
  id: number;
  documentType: string;
  status?: string;
  updatedAt: string;

  constructor(id: number, documentType: string, status?: string, updatedAt: string = new Date().toISOString()) {
    this.id = Number(id); // Ensure it's definitely a number
    this.documentType = documentType;
    this.status = status;
    this.updatedAt = updatedAt;
  }
} 