export interface Schedule {
    id: number;
    startDate: string;
    interval: number;
    startTime: string | null;
    scheduleType: string;
    selectedDays: string[];
    endDate: string | null;
  
    // Opcionales para mensual
    monthlyOptionType?: string;
    monthlyDay?: number;
    monthlyWeek?: string;
    monthlyWeekday?: string;
  
    // Opcionales para anual
    yearlyOptionType?: string;
    yearlyDay?: number;
    yearlyMonth?: number;
    yearlyWeek?: string;
    yearlyWeekday?: string;
  
    // Extras si los necesitas más adelante
    status?: string;
  }
  