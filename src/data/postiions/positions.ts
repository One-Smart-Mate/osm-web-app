export interface Position {
  id: number;
  siteId: number;
  siteName: string;
  siteType: string;
  areaId: number;
  areaName: string;
  levelId: number;
  levelName: string;
  route: string | null;
  name: string;
  description: string | null;
  status: string;
  nodeResponsableId?: number | null;
  nodeResponsableName?: string | null;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  userIds?: number[];
}
