// ciltSecuencesSchedule.ts
export interface CiltSecuencesSchedule {
    id: number;
    siteId: number | null;
    ciltId: number | null;
    secuenceId: number | null;
    frecuency: string | null;
    schedule: Date | null;
    scheduleType: string | null;
    endDate: Date | null;
    mon: number | null;
    tue: number | null;
    wed: number | null;
    thu: number | null;
    fri: number | null;
    sat: number | null;
    sun: number | null;
    dayOfMonth: number | null;
    weekOfMonth: number | null;
    dateOfYear: Date | null;
    monthOfYear: number | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
  }
  
  // create-cilt-secuences-schedule.dto.ts
  export interface CreateCiltSecuencesScheduleDto {
    siteId?: number;
    ciltId?: number;
    secuenceId?: number;
    frecuency?: string;
    schedule?: string;
    scheduleType?: string;
    endDate?: string;
    mon?: number;
    tue?: number;
    wed?: number;
    thu?: number;
    fri?: number;
    sat?: number;
    sun?: number;
    dayOfMonth?: number;
    weekOfMonth?: number;
    dateOfYear?: string;
    monthOfYear?: number;
    status?: string;
    createdAt: string;
  }
  
  // update-cilt-secuences-schedule.dto.ts
  export interface UpdateCiltSecuencesScheduleDto {
    id: number;
    siteId?: number;
    ciltId?: number;
    secuenceId?: number;
    frecuency?: string;
    schedule?: string;
    scheduleType?: string;
    endDate?: string;
    mon?: number;
    tue?: number;
    wed?: number;
    thu?: number;
    fri?: number;
    sat?: number;
    sun?: number;
    dayOfMonth?: number;
    weekOfMonth?: number;
    dateOfYear?: string;
    monthOfYear?: number;
    status?: string;
    updatedAt: string;
  }
  