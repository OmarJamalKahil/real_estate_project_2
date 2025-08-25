// // src/statistics/services/general-statistics.service.ts

// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { DataSource, QueryRunner, Repository } from "typeorm";
// import { generalStatistics } from "../entities/general-statistics.entity";
// import { DailyStats, MonthlyStats, RawStatsResult, WeeklyStats, YearlyStats } from "../common/interface/general-statistics.interface";


 
// @Injectable()
// export class GeneralStatisticsService {
//     constructor(
//         @InjectRepository(generalStatistics)
//         private readonly generalStatisticsRepository: Repository<generalStatistics>,
//         private readonly dataSource: DataSource,
//     ) { }


//     async createGeneralStats(
//         queryRunner: QueryRunner,
//         amount: number
//     ) {
//         const generalStats = queryRunner.manager.create(generalStatistics, {
//             amount
//         })
//         await queryRunner.manager.save(generalStats)
//     }

//     async getGeneralStats() {
//         const query = this.dataSource.getRepository(generalStatistics)
//             .createQueryBuilder("stats")
//             .select("DATE(stats.createdAt)", "dailyDate")
//             .addSelect("WEEK(stats.createdAt)", "weeklyWeek")
//             .addSelect("YEAR(stats.createdAt)", "yearlyYear")
//             .addSelect("DATE_FORMAT(stats.createdAt, '%Y-%m')", "monthlyMonth")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear")
//             .orderBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear", "ASC");

//         const rawResults: RawStatsResult[] = await query.getRawMany();

//         const dailyStats: DailyStats[] = [];
//         const weeklyStats: WeeklyStats[] = [];
//         const monthlyStats: MonthlyStats[] = [];
//         const yearlyStats: YearlyStats[] = [];

//         rawResults.forEach(row => {
//             // Daily Stats
//             if (row.dailyDate) {
//                 const existing = dailyStats.find(d => d.date === row.dailyDate);
//                 if (existing) {
//                     existing.totalAmount += parseFloat(row.totalAmount);
//                     existing.transactionCount += parseInt(row.transactionCount);
//                 } else {
//                     dailyStats.push({
//                         date: row.dailyDate,
//                         totalAmount: parseFloat(row.totalAmount),
//                         transactionCount: parseInt(row.transactionCount)
//                     });
//                 }
//             }

//             // Weekly Stats
//             if (row.weeklyWeek && row.yearlyYear) {
//                 const existing = weeklyStats.find(w => w.week === row.weeklyWeek && w.year === row.yearlyYear);
//                 if (existing) {
//                     existing.totalAmount += parseFloat(row.totalAmount);
//                     existing.transactionCount += parseInt(row.transactionCount);
//                 } else {
//                     weeklyStats.push({
//                         week: row.weeklyWeek,
//                         year: row.yearlyYear,
//                         totalAmount: parseFloat(row.totalAmount),
//                         transactionCount: parseInt(row.transactionCount)
//                     });
//                 }
//             }

//             // Monthly Stats
//             if (row.monthlyMonth) {
//                 const existing = monthlyStats.find(m => m.month === row.monthlyMonth);
//                 if (existing) {
//                     existing.totalAmount += parseFloat(row.totalAmount);
//                     existing.transactionCount += parseInt(row.transactionCount);
//                 } else {
//                     monthlyStats.push({
//                         month: row.monthlyMonth,
//                         totalAmount: parseFloat(row.totalAmount),
//                         transactionCount: parseInt(row.transactionCount)
//                     });
//                 }
//             }

//             // Yearly Stats
//             if (row.yearlyYear) {
//                 const existing = yearlyStats.find(y => y.year === row.yearlyYear);
//                 if (existing) {
//                     existing.totalAmount += parseFloat(row.totalAmount);
//                     existing.transactionCount += parseInt(row.transactionCount);
//                 } else {
//                     yearlyStats.push({
//                         year: row.yearlyYear,
//                         totalAmount: parseFloat(row.totalAmount),
//                         transactionCount: parseInt(row.transactionCount)
//                     });
//                 }
//             }
//         });

//         return {
//             dailyStats,
//             weeklyStats,
//             monthlyStats,
//             yearlyStats,
//         };
//     }



// }












// src/statistics/services/general-statistics.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { generalStatistics } from "../entities/general-statistics.entity";
import { DailyStats, MonthlyStats, RawStatsResult, WeeklyStats, YearlyStats } from "../common/interface/general-statistics.interface";


@Injectable()
export class GeneralStatisticsService {
    constructor(
        @InjectRepository(generalStatistics)
        private readonly generalStatisticsRepository: Repository<generalStatistics>,
        private readonly dataSource: DataSource,
    ) { }


    async createGeneralStats(
        queryRunner: QueryRunner,
        amount: number
    ) {
        const generalStats = queryRunner.manager.create(generalStatistics, {
            amount
        })
        await queryRunner.manager.save(generalStats)
    }

    async getGeneralStats() {
        const query = this.dataSource.getRepository(generalStatistics)
            .createQueryBuilder("stats")
            .select("DATE(stats.createdAt)", "dailyDate")
            .addSelect("EXTRACT(WEEK FROM stats.createdAt)", "weeklyWeek")
            .addSelect("EXTRACT(YEAR FROM stats.createdAt)", "yearlyYear")
            .addSelect("to_char(stats.createdAt, 'YYYY-MM')", "monthlyMonth")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear")
            .orderBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear", "ASC");

        const rawResults: RawStatsResult[] = await query.getRawMany();

        const dailyStats: DailyStats[] = [];
        const weeklyStats: WeeklyStats[] = [];
        const monthlyStats: MonthlyStats[] = [];
        const yearlyStats: YearlyStats[] = [];

        rawResults.forEach(row => {
            // Daily Stats
            if (row.dailyDate) {
                const existing = dailyStats.find(d => d.date === row.dailyDate);
                if (existing) {
                    existing.totalAmount += parseFloat(row.totalAmount);
                    existing.transactionCount += parseInt(row.transactionCount);
                } else {
                    dailyStats.push({
                        date: row.dailyDate,
                        totalAmount: parseFloat(row.totalAmount),
                        transactionCount: parseInt(row.transactionCount)
                    });
                }
            }

            // Weekly Stats
            if (row.weeklyWeek && row.yearlyYear) {
                const existing = weeklyStats.find(w => w.week === row.weeklyWeek && w.year === row.yearlyYear);
                if (existing) {
                    existing.totalAmount += parseFloat(row.totalAmount);
                    existing.transactionCount += parseInt(row.transactionCount);
                } else {
                    weeklyStats.push({
                        week: row.weeklyWeek,
                        year: row.yearlyYear,
                        totalAmount: parseFloat(row.totalAmount),
                        transactionCount: parseInt(row.transactionCount)
                    });
                }
            }

            // Monthly Stats
            if (row.monthlyMonth) {
                const existing = monthlyStats.find(m => m.month === row.monthlyMonth);
                if (existing) {
                    existing.totalAmount += parseFloat(row.totalAmount);
                    existing.transactionCount += parseInt(row.transactionCount);
                } else {
                    monthlyStats.push({
                        month: row.monthlyMonth,
                        totalAmount: parseFloat(row.totalAmount),
                        transactionCount: parseInt(row.transactionCount)
                    });
                }
            }

            // Yearly Stats
            if (row.yearlyYear) {
                const existing = yearlyStats.find(y => y.year === row.yearlyYear);
                if (existing) {
                    existing.totalAmount += parseFloat(row.totalAmount);
                    existing.transactionCount += parseInt(row.transactionCount);
                } else {
                    yearlyStats.push({
                        year: row.yearlyYear,
                        totalAmount: parseFloat(row.totalAmount),
                        transactionCount: parseInt(row.transactionCount)
                    });
                }
            }
        });

        return {
            dailyStats,
            weeklyStats,
            monthlyStats,
            yearlyStats,
        };
    }
}