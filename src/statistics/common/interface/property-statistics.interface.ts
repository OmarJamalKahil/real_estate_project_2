import { OperationTypeStatistics } from "src/statistics/entities/property-statistics.entity";

export interface RawStatsResult {
    dailyDate?: string;
    weeklyWeek?: string;
    yearlyYear?: string;
    monthlyMonth?: string;
    operationType?: OperationTypeStatistics;
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

export interface OperationStats {
    operationType: OperationTypeStatistics;
    totalAmount: number;
    transactionCount: number;
}

export interface CombinedStats {
    dailyStats: DailyStats[];
    weeklyStats: WeeklyStats[];
    monthlyStats: MonthlyStats[];
    yearlyStats: YearlyStats[];
    operationTypeStats: OperationStats[];
}