export class CreatePosition {
    constructor(
      public siteId: number | null,
      public siteName: string | null,
      public siteType: string | null,
      public areaId: number | null,
      public areaName: string | null,
      public levelId: number | null,
      public levelName: string | null,
      public route: string | null,
      public name: string,
      public description: string | null,
      public status: string | null,
      public userIds?: number[]
    ) {
      console.log("CreatePosition created with values:", {
        siteId,
        siteName,
        siteType,
        areaId,
        areaName,
        levelId,
        levelName,
        route,
        name,
        description,
        status,
        userIds,
      });
    }
  }