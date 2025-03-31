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
  createdAt?: string;
  updatedAt?: string;
}
