export interface OplTypes {
  id: number;
  documentType: string | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt?: Date | null;
} 