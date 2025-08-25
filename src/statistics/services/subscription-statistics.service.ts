// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { SubscriptionStatistics } from "../entities/subscription-statistics.entity";
// import { DataSource, QueryRunner, Repository } from "typeorm";
// import * as dayjs from 'dayjs'; // You may need to install this library: npm install dayjs
// import { OperationTypeStatistics } from "../entities/property-statistics.entity";
// import { Subscription } from "src/subscription/entities/subscription.entity";

// @Injectable()
// export class SubscriptionStatisticsService {
//     constructor(
//         @InjectRepository(SubscriptionStatistics)
//         private readonly subscriptionStatisticsRepository: Repository<SubscriptionStatistics>,
//         private readonly dataSource: DataSource,
//     ) { }


//     async createSubscriptionStats(
//         queryRunner: QueryRunner,
//         amount: number,
//         subcription: Subscription
//     ) {
//         const subscriptionStats = queryRunner.manager.create(SubscriptionStatistics, {
//             amount,
//             subcription
//         })
//         await queryRunner.manager.save(subscriptionStats)
//     }

//     async getSubscriptionStats() {
//         // Daily Statistics
//         const dailyStats = await this.dataSource.getRepository(SubscriptionStatistics)
//             .createQueryBuilder("stats")
//             .select("DATE(stats.createdAt)", "date")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("date")
//             .orderBy("date", "ASC")
//             .getRawMany();

//         // Weekly Statistics
//         const weeklyStats = await this.dataSource.getRepository(SubscriptionStatistics)
//             .createQueryBuilder("stats")
//             .select("WEEK(stats.createdAt)", "week")
//             .addSelect("YEAR(stats.createdAt)", "year")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("week, year")
//             .orderBy("year, week", "ASC")
//             .getRawMany();

//         // Monthly Statistics
//         const monthlyStats = await this.dataSource.getRepository(SubscriptionStatistics)
//             .createQueryBuilder("stats")
//             .select("DATE_FORMAT(stats.createdAt, '%Y-%m')", "month")
//             .addSelect("SUM(stats.amount)", "totalAmount")
//             .addSelect("COUNT(stats.id)", "transactionCount")
//             .groupBy("month")
//             .orderBy("month", "ASC")
//             .getRawMany();

//         return {
//             dailyStats,
//             weeklyStats,
//             monthlyStats
//         };
//     }




// }










import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubscriptionStatistics } from "../entities/subscription-statistics.entity";
import { DataSource, QueryRunner, Repository } from "typeorm";
import * as dayjs from 'dayjs'; 
import { OperationTypeStatistics } from "../entities/property-statistics.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";

@Injectable()
export class SubscriptionStatisticsService {
    constructor(
        @InjectRepository(SubscriptionStatistics)
        private readonly subscriptionStatisticsRepository: Repository<SubscriptionStatistics>,
        private readonly dataSource: DataSource,
    ) { }


    async createSubscriptionStats(
        queryRunner: QueryRunner,
        amount: number,
        subcription: Subscription
    ) {
        const subscriptionStats = queryRunner.manager.create(SubscriptionStatistics, {
            amount,
            subcription
        })
        await queryRunner.manager.save(subscriptionStats)
    }

    async getSubscriptionStats() {
        // Daily Statistics
        const dailyStats = await this.dataSource.getRepository(SubscriptionStatistics)
            .createQueryBuilder("stats")
            .select("DATE(stats.createdAt)", "date")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("date")
            .orderBy("date", "ASC")
            .getRawMany();

        // Weekly Statistics
        const weeklyStats = await this.dataSource.getRepository(SubscriptionStatistics)
            .createQueryBuilder("stats")
            .select("EXTRACT(WEEK FROM stats.createdAt)", "week")
            .addSelect("EXTRACT(YEAR FROM stats.createdAt)", "year")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("week, year")
            .orderBy("year, week", "ASC")
            .getRawMany();

        // Monthly Statistics
        const monthlyStats = await this.dataSource.getRepository(SubscriptionStatistics)
            .createQueryBuilder("stats")
            .select("to_char(stats.createdAt, 'YYYY-MM')", "month")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("month")
            .orderBy("month", "ASC")
            .getRawMany();

        return {
            dailyStats,
            weeklyStats,
            monthlyStats
        };
    }
}