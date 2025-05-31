export type ScheduleType = "dai" | "wee" | "mon" | "yea" | "man";

export interface CiltSecuencesSchedule {
  id: number;
  siteId: number | null;
  ciltId: number | null;
  secuenceId: number | null;
  frecuency: string | null;
  schedule: string | null;
  scheduleType: ScheduleType | null;
  endDate: string | null;
  mon: number | null;
  tue: number | null;
  wed: number | null;
  thu: number | null;
  fri: number | null;
  sat: number | null;
  sun: number | null;
  dayOfMonth: number | null;
  weekOfMonth: number | null;
  dateOfYear: string | null;
  monthOfYear: number | null;
  allowExecuteBefore: number | null;
  allowExecuteBeforeMinutes: number | null;
  toleranceBeforeMinutes: number | null;
  toleranceAfterMinutes: number | null;
  allowExecuteAfterDue: number | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface CreateCiltSecuencesScheduleDTO {
  siteId?: number;
  ciltId?: number;
  secuenceId?: number;
  frecuency?: string;
  schedule?: string;
  scheduleType?: ScheduleType;
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
  allowExecuteBefore?: number;
  allowExecuteBeforeMinutes?: number;
  toleranceBeforeMinutes?: number;
  toleranceAfterMinutes?: number;
  allowExecuteAfterDue?: number;
  status?: string;
  createdAt: string;
}

export interface UpdateCiltSecuencesScheduleDTO {
  id: number;
  siteId?: number;
  ciltId?: number;
  secuenceId?: number;
  frecuency?: string;
  schedule?: string;
  scheduleType?: ScheduleType;
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
  allowExecuteBefore?: number;
  allowExecuteBeforeMinutes?: number;
  toleranceBeforeMinutes?: number;
  toleranceAfterMinutes?: number;
  allowExecuteAfterDue?: number;
  status?: string;
  updatedAt: string;
}
