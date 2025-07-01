export interface AmDiscardReason {
  id: number;
  siteId?: number | null;
  discardReason: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

export interface CreateAmDiscardReasonDTO {
  siteId?: number;
  discardReason: string;
  createdAt: string;
}

export interface UpdateAmDiscardReasonDTO {
  id: number;
  siteId?: number;
  discardReason?: string;
  updatedAt: string;
} 