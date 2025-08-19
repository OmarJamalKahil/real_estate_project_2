export interface RawStatsResult {
    dailyDate?: string;
    weeklyWeek?: string;
    yearlyYear?: string;
    monthlyMonth?: string;
    totalAmount: string;
    transactionCount: string;
}

export interface DailyStats {
    date: string;
    totalAmount: number;
    transactionCount: number;
}

export interface WeeklyStats {
    week: string;
    year: string;
    totalAmount: number;
    transactionCount: number;
}

export interface MonthlyStats {
    month: string;
    totalAmount: number;
    transactionCount: number;
}

export interface YearlyStats {
    year: string;
    totalAmount: number;
    transactionCount: number;
}