export interface OplTypes {
  id: number;
  siteId: number;
  documentType: string | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt?: Date | null;
} 