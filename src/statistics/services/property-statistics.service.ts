// // import { Injectable } from "@nestjs/common";
// // import { InjectRepository } from "@nestjs/typeorm";
// // import { PropertyStatistics, OperationTypeStatistics } from "../entities/property-statistics.entity";
// // import { DataSource, QueryRunner, Repository } from "typeorm";
// // import * as dayjs from 'dayjs';
// // import { DailyStats, MonthlyStats, OperationStats, RawStatsResult, WeeklyStats, YearlyStats } from "../common/interface/property-statistics.interface";
// // import { Property } from "src/property/entities/property.entity";





// // @Injectable()
// // export class PropertyStatisticsService {
// //     constructor(
// //         @InjectRepository(PropertyStatistics)
// //         private readonly propertyStatisticsRepository: Repository<PropertyStatistics>,
// //         private readonly dataSource: DataSource,
// //     ) { }


// //     async createPropertyStats(
// //         queryRunner: QueryRunner,
// //         amount: number,
// //         operationType: OperationTypeStatistics,
// //         property: Property
// //     ) {
// //         const propertyStats = queryRunner.manager.create(PropertyStatistics, {
// //             operationType,
// //             amount,
// //             property
// //         })
// //         await queryRunner.manager.save(propertyStats)
// //     }


// //     // Function 1: Daily, Weekly, Monthly, and Yearly Statistics
// //     async getTimeBasedStats() {
// //         const dailyStats = await this.dataSource.getRepository(PropertyStatistics)
// //             .createQueryBuilder("stats")
// //             .select("DATE(stats.createdAt)", "date")
// //             .addSelect("SUM(stats.amount)", "totalAmount")
// //             .addSelect("COUNT(stats.id)", "transactionCount")
// //             .groupBy("date")
// //             .orderBy("date", "ASC")
// //             .getRawMany();

// //         const weeklyStats = await this.dataSource.getRepository(PropertyStatistics)
// //             .createQueryBuilder("stats")
// //             .select("WEEK(stats.createdAt)", "week")
// //             .addSelect("YEAR(stats.createdAt)", "year")
// //             .addSelect("SUM(stats.amount)", "totalAmount")
// //             .addSelect("COUNT(stats.id)", "transactionCount")
// //             .groupBy("week, year")
// //             .orderBy("year, week", "ASC")
// //             .getRawMany();

// //         const monthlyStats = await this.dataSource.getRepository(PropertyStatistics)
// //             .createQueryBuilder("stats")
// //             .select("DATE_FORMAT(stats.createdAt, '%Y-%m')", "month")
// //             .addSelect("SUM(stats.amount)", "totalAmount")
// //             .addSelect("COUNT(stats.id)", "transactionCount")
// //             .groupBy("month")
// //             .orderBy("month", "ASC")
// //             .getRawMany();

// //         const yearlyStats = await this.dataSource.getRepository(PropertyStatistics)
// //             .createQueryBuilder("stats")
// //             .select("YEAR(stats.createdAt)", "year")
// //             .addSelect("SUM(stats.amount)", "totalAmount")
// //             .addSelect("COUNT(stats.id)", "transactionCount")
// //             .groupBy("year")
// //             .orderBy("year", "ASC")
// //             .getRawMany();

// //         return {
// //             dailyStats,
// //             weeklyStats,
// //             monthlyStats,
// //             yearlyStats
// //         };
// //     }

// //     // Function 2: Statistics by Operation Type
// //     async getOperationTypeStats() {
// //         const operationStats = await this.dataSource.getRepository(PropertyStatistics)
// //             .createQueryBuilder("stats")
// //             .select("stats.operationType", "operationType")
// //             .addSelect("SUM(stats.amount)", "totalAmount")
// //             .addSelect("COUNT(stats.id)", "transactionCount")
// //             .groupBy("stats.operationType")
// //             .getRawMany();

// //         return operationStats;
// //     }

// //     // Function 3: Merged Statistics
// //     // async getAllPropertyStats() {
// //     //     const timeBasedStats = await this.getTimeBasedStats();
// //     //     const operationTypeStats = await this.getOperationTypeStats();

// //     //     return {
// //     //         ...timeBasedStats,
// //     //         operationTypeStats
// //     //     };
// //     // }


// //     async getCombinedStats() {
// //         const query = this.dataSource.getRepository(PropertyStatistics)
// //             .createQueryBuilder("stats")
// //             .select("DATE(stats.createdAt)", "dailyDate")
// //             .addSelect("WEEK(stats.createdAt)", "weeklyWeek")
// //             .addSelect("YEAR(stats.createdAt)", "yearlyYear")
// //             .addSelect("DATE_FORMAT(stats.createdAt, '%Y-%m')", "monthlyMonth")
// //             .addSelect("stats.operationType", "operationType")
// //             .addSelect("SUM(stats.amount)", "totalAmount")
// //             .addSelect("COUNT(stats.id)", "transactionCount")
// //             .groupBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear, operationType")
// //             .orderBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear", "ASC");

// //         const rawResults: RawStatsResult[] = await query.getRawMany();

// //         const dailyStats: DailyStats[] = [];
// //         const weeklyStats: WeeklyStats[] = [];
// //         const monthlyStats: MonthlyStats[] = [];
// //         const yearlyStats: YearlyStats[] = [];
// //         const operationTypeStats: OperationStats[] = [];

// //         rawResults.forEach(row => {
// //             // Daily Stats
// //             if (row.dailyDate) {
// //                 const existing = dailyStats.find(d => d.date === row.dailyDate);
// //                 if (existing) {
// //                     existing.totalAmount += parseFloat(row.totalAmount);
// //                     existing.transactionCount += parseInt(row.transactionCount);
// //                 } else {
// //                     dailyStats.push({
// //                         date: row.dailyDate,
// //                         totalAmount: parseFloat(row.totalAmount),
// //                         transactionCount: parseInt(row.transactionCount)
// //                     });
// //                 }
// //             }

// //             // Weekly Stats
// //             if (row.weeklyWeek && row.yearlyYear) {
// //                 const existing = weeklyStats.find(w => w.week === row.weeklyWeek && w.year === row.yearlyYear);
// //                 if (existing) {
// //                     existing.totalAmount += parseFloat(row.totalAmount);
// //                     existing.transactionCount += parseInt(row.transactionCount);
// //                 } else {
// //                     weeklyStats.push({
// //                         week: row.weeklyWeek,
// //                         year: row.yearlyYear,
// //                         totalAmount: parseFloat(row.totalAmount),
// //                         transactionCount: parseInt(row.transactionCount)
// //                     });
// //                 }
// //             }

// //             // Monthly Stats
// //             if (row.monthlyMonth) {
// //                 const existing = monthlyStats.find(m => m.month === row.monthlyMonth);
// //                 if (existing) {
// //                     existing.totalAmount += parseFloat(row.totalAmount);
// //                     existing.transactionCount += parseInt(row.transactionCount);
// //                 } else {
// //                     monthlyStats.push({
// //                         month: row.monthlyMonth,
// //                         totalAmount: parseFloat(row.totalAmount),
// //                         transactionCount: parseInt(row.transactionCount)
// //                     });
// //                 }
// //             }

// //             // Yearly Stats
// //             if (row.yearlyYear) {
// //                 const existing = yearlyStats.find(y => y.year === row.yearlyYear);
// //                 if (existing) {
// //                     existing.totalAmount += parseFloat(row.totalAmount);
// //                     existing.transactionCount += parseInt(row.transactionCount);
// //                 } else {
// //                     yearlyStats.push({
// //                         year: row.yearlyYear,
// //                         totalAmount: parseFloat(row.totalAmount),
// //                         transactionCount: parseInt(row.transactionCount)
// //                     });
// //                 }
// //             }

// //             // Operation Type Stats
// //             if (row.operationType) {
// //                 const existing = operationTypeStats.find(o => o.operationType === row.operationType);
// //                 if (existing) {
// //                     existing.totalAmount += parseFloat(row.totalAmount);
// //                     existing.transactionCount += parseInt(row.transactionCount);
// //                 } else {
// //                     operationTypeStats.push({
// //                         operationType: row.operationType,
// //                         totalAmount: parseFloat(row.totalAmount),
// //                         transactionCount: parseInt(row.transactionCount)
// //                     });
// //                 }
// //             }
// //         });

// //         return {
// //             dailyStats,
// //             weeklyStats,
// //             monthlyStats,
// //             yearlyStats,
// //             operationTypeStats
// //         };
// //     }

// // }




// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { PropertyStatistics, OperationTypeStatistics } from "../entities/property-statistics.entity";
// import { DataSource, QueryRunner, Repository } from "typeorm";
// import * as dayjs from 'dayjs';
// import { DailyStats, MonthlyStats, OperationStats, RawStatsResult, WeeklyStats, YearlyStats } from "../common/interface/property-statistics.interface";
// import { Property } from "src/property/entities/property.entity";


// @Injectable()
// export class PropertyStatisticsService {
//     constructor(
//         @InjectRepository(PropertyStatistics)
//         private readonly propertyStatisticsRepository: Repository<PropertyStatistics>,
//         private readonly dataSource: DataSource,
//     ) { }


//     async createPropertyStats(
//         queryRunner: QueryRunner,
//         amount: number,
//         operationType: OperationTypeStatistics,
//         property: Property
//     ) {
//         const propertyStats = queryRunner.manager.create(PropertyStatistics, {
//             operationType,
//             amount,
//             property
//         })
//         await queryRunner.manager.save(propertyStats)
//     }


//     // Function 1: Daily, Weekly, Monthly, and Yearly Statistics
//     async getTimeBasedStats() {
//         const dailyStats = await this.dataSource.getRepository(PropertyStatistics)
//             .createQueryBuilder("stats")
//             .select("DATE(stats.createdAt)", "date")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("date")
//             .orderBy("date", "ASC")
//             .getRawMany();

//         const weeklyStats = await this.dataSource.getRepository(PropertyStatistics)
//             .createQueryBuilder("stats")
//             .select("EXTRACT(WEEK FROM stats.createdAt)", "week")
//             .addSelect("EXTRACT(YEAR FROM stats.createdAt)", "year")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("week, year")
//             .orderBy("year, week", "ASC")
//             .getRawMany();

//         const monthlyStats = await this.dataSource.getRepository(PropertyStatistics)
//             .createQueryBuilder("stats")
//             .select("to_char(stats.createdAt, 'YYYY-MM')", "month")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("month")
//             .orderBy("month", "ASC")
//             .getRawMany();

//         const yearlyStats = await this.dataSource.getRepository(PropertyStatistics)
//             .createQueryBuilder("stats")
//             .select("EXTRACT(YEAR FROM stats.createdAt)", "year")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("year")
//             .orderBy("year", "ASC")
//             .getRawMany();

//         return {
//             dailyStats,
//             weeklyStats,
//             monthlyStats,
//             yearlyStats
//         };
//     }

//     // Function 2: Statistics by Operation Type
//     async getOperationTypeStats() {
//         const operationStats = await this.dataSource.getRepository(PropertyStatistics)
//             .createQueryBuilder("stats")
//             .select("stats.operationType", "operationType")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("stats.operationType")
//             .getRawMany();

//         return operationStats;
//     }


//     async getCombinedStats() {
//         const query = this.dataSource.getRepository(PropertyStatistics)
//             .createQueryBuilder("stats")
//             .select("DATE(stats.createdAt)", "dailyDate")
//             .addSelect("EXTRACT(WEEK FROM stats.createdAt)", "weeklyWeek")
//             .addSelect("EXTRACT(YEAR FROM stats.createdAt)", "yearlyYear")
//             .addSelect("to_char(stats.createdAt, 'YYYY-MM')", "monthlyMonth")
//             .addSelect("stats.operationType", "operationType")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear, operationType")
//             .orderBy("dailyDate, weeklyWeek, monthlyMonth, yearlyYear", "ASC");

//         const rawResults: RawStatsResult[] = await query.getRawMany();

//         const dailyStats: DailyStats[] = [];
//         const weeklyStats: WeeklyStats[] = [];
//         const monthlyStats: MonthlyStats[] = [];
//         const yearlyStats: YearlyStats[] = [];
//         const operationTypeStats: OperationStats[] = [];

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

//             // Operation Type Stats
//             if (row.operationType) {
//                 const existing = operationTypeStats.find(o => o.operationType === row.operationType);
//                 if (existing) {
//                     existing.totalAmount += parseFloat(row.totalAmount);
//                     existing.transactionCount += parseInt(row.transactionCount);
//                 } else {
//                     operationTypeStats.push({
//                         operationType: row.operationType,
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
//             operationTypeStats
//         };
//     }
// }




import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PropertyStatistics, OperationTypeStatistics } from "../entities/property-statistics.entity";
import { DataSource, QueryRunner, Repository } from "typeorm";
import * as dayjs from 'dayjs';
import { DailyStats, MonthlyStats, OperationStats, RawStatsResult, WeeklyStats, YearlyStats } from "../common/interface/property-statistics.interface";
import { Property } from "src/property/entities/property.entity";


@Injectable()
export class PropertyStatisticsService {
    constructor(
        @InjectRepository(PropertyStatistics)
        private readonly propertyStatisticsRepository: Repository<PropertyStatistics>,
        private readonly dataSource: DataSource,
    ) { }


    async createPropertyStats(
        queryRunner: QueryRunner,
        amount: number,
        operationType: OperationTypeStatistics,
        property: Property
    ) {
        const propertyStats = queryRunner.manager.create(PropertyStatistics, {
            operationType,
            amount,
            property
        })
        await queryRunner.manager.save(propertyStats)
    }


    // Function 1: Daily, Weekly, Monthly, and Yearly Statistics
    async getTimeBasedStats() {
        const dailyStats = await this.dataSource.getRepository(PropertyStatistics)
            .createQueryBuilder("stats")
            .select("DATE(stats.createdAt)", "date")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("DATE(stats.createdAt)")
            .orderBy("DATE(stats.createdAt)", "ASC")
            .getRawMany();

        const weeklyStats = await this.dataSource.getRepository(PropertyStatistics)
            .createQueryBuilder("stats")
            .select("EXTRACT(WEEK FROM stats.createdAt)", "week")
            .addSelect("EXTRACT(YEAR FROM stats.createdAt)", "year")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("EXTRACT(WEEK FROM stats.createdAt), EXTRACT(YEAR FROM stats.createdAt)")
            .orderBy("EXTRACT(YEAR FROM stats.createdAt), EXTRACT(WEEK FROM stats.createdAt)", "ASC")
            .getRawMany();

        const monthlyStats = await this.dataSource.getRepository(PropertyStatistics)
            .createQueryBuilder("stats")
            .select("to_char(stats.createdAt, 'YYYY-MM')", "month")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("to_char(stats.createdAt, 'YYYY-MM')")
            .orderBy("to_char(stats.createdAt, 'YYYY-MM')", "ASC")
            .getRawMany();

        const yearlyStats = await this.dataSource.getRepository(PropertyStatistics)
            .createQueryBuilder("stats")
            .select("EXTRACT(YEAR FROM stats.createdAt)", "year")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("EXTRACT(YEAR FROM stats.createdAt)")
            .orderBy("EXTRACT(YEAR FROM stats.createdAt)", "ASC")
            .getRawMany();

        return {
            dailyStats,
            weeklyStats,
            monthlyStats,
            yearlyStats
        };
    }

    // Function 2: Statistics by Operation Type
    async getOperationTypeStats() {
        const operationStats = await this.dataSource.getRepository(PropertyStatistics)
            .createQueryBuilder("stats")
            .select("stats.operationType", "operationType")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("stats.operationType")
            .getRawMany();

        return operationStats;
    }


    async getCombinedStats() {
        const query = this.dataSource.getRepository(PropertyStatistics)
            .createQueryBuilder("stats")
            .select("DATE(stats.createdAt)", "dailyDate")
            .addSelect("EXTRACT(WEEK FROM stats.createdAt)", "weeklyWeek")
            .addSelect("EXTRACT(YEAR FROM stats.createdAt)", "yearlyYear")
            .addSelect("to_char(stats.createdAt, 'YYYY-MM')", "monthlyMonth")
            .addSelect("stats.operationType", "operationType")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("DATE(stats.createdAt), EXTRACT(WEEK FROM stats.createdAt), to_char(stats.createdAt, 'YYYY-MM'), EXTRACT(YEAR FROM stats.createdAt), stats.operationType")
            .orderBy("DATE(stats.createdAt), EXTRACT(WEEK FROM stats.createdAt), to_char(stats.createdAt, 'YYYY-MM'), EXTRACT(YEAR FROM stats.createdAt)", "ASC");

        const rawResults: RawStatsResult[] = await query.getRawMany();

        const dailyStats: DailyStats[] = [];
        const weeklyStats: WeeklyStats[] = [];
        const monthlyStats: MonthlyStats[] = [];
        const yearlyStats: YearlyStats[] = [];
        const operationTypeStats: OperationStats[] = [];

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

            // Operation Type Stats
            if (row.operationType) {
                const existing = operationTypeStats.find(o => o.operationType === row.operationType);
                if (existing) {
                    existing.totalAmount += parseFloat(row.totalAmount);
                    existing.transactionCount += parseInt(row.transactionCount);
                } else {
                    operationTypeStats.push({
                        operationType: row.operationType,
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
            operationTypeStats
        };
    }
}