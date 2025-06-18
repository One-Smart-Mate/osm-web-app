export type ScheduleType = "dai" | "wee" | "mon" | "yea" | "man";

// This represents the data structure as it comes from the database
export interface CiltSecuencesSchedule {
  id: number;
  siteId: number | null;
  ciltId: number | null;
  secuenceId: number | null;
  frecuency: string | null;
  schedules: string[]; // Updated from schedule: string
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
  order: number | null; // Added
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

// This matches the backend Create DTO
export interface CreateCiltSecuencesScheduleDTO {
  siteId?: number;
  ciltId?: number;
  secuenceId?: number;
  frecuency?: string;
  schedules: string[]; // Updated from schedule?: string and made mandatory
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
  order?: number; // Added
  createdAt: string;
}

// This is a partial of the main interface for updates
export interface UpdateCiltSecuencesScheduleDTO {
  id: number;
  siteId?: number;
  ciltId?: number;
  secuenceId?: number;
  frecuency?: string;
  schedules?: string[]; // Updated from schedule?: string
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
  order?: number; // Added
  updatedAt: string; // This is likely set by the backend, but keeping it as per original file
}
