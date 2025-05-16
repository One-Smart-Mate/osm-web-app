// Mocked TypeScript interfaces and example data for Cilt-related domain models

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface Execution {
  id: number;
  secuenceStart: string;
  secuenceStop: string;
  duration: number;
  initialParameter: string;
  finalParameter: string;
}

export interface Sequence {
  id: number;
  levelName: string;
  ciltTypeName: string;
  secuenceList: string;
  secuenceColor: string;
  toolsRequired: string;
  standardOk: string;
  stoppageReason: number;
  machineStopped: number;
  referencePoint?: string;
  status: string;
  executions: Execution[];
}

export interface CiltMaster {
  id: number;
  siteId: number;
  positionId: number;
  ciltName: string;
  ciltDescription: string;
  creatorName: string;
  reviewerName: string;
  approvedByName: string;
  urlImgLayout?: string;
  updatedAt?: string;
  status: string;
  sequences: Sequence[];
}

export interface Position {
  id: number;
  name: string;
  siteName: string;
  areaName: string;
  ciltMasters: CiltMaster[];
}

export interface CiltData {
  userInfo: UserInfo;
  positions: Position[];
}

// Example mock data
export const mockCiltData: CiltData = {
  userInfo: {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
  },
  positions: [
    {
      id: 101,
      name: "Operator",
      siteName: "Main Plant",
      areaName: "Assembly",
      ciltMasters: [
        {
          id: 201,
          siteId: 1,
          positionId: 101,
          ciltName: "CILT-001",
          ciltDescription: "Routine cleaning procedure",
          creatorName: "Alice Smith",
          reviewerName: "Bob Brown",
          approvedByName: "Carol White",
          urlImgLayout: "https://example.com/layout.png",
          updatedAt: "2025-05-15T10:00:00Z",
          status: "active",
          sequences: [
            {
              id: 301,
              levelName: "Level 1",
              ciltTypeName: "Cleaning",
              secuenceList: "Step 1, Step 2, Step 3",
              secuenceColor: "#FF0000",
              toolsRequired: "Brush, Gloves",
              standardOk: "50-60 psi",
              stoppageReason: 1,
              machineStopped: 0,
              referencePoint: "Point A",
              status: "ok",
              executions: [
                {
                  id: 401,
                  secuenceStart: "2025-05-15T08:00:00Z",
                  secuenceStop: "2025-05-15T08:10:00Z",
                  duration: 10,
                  initialParameter: "55 psi",
                  finalParameter: "58 psi",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
