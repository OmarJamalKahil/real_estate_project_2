import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubscriptionStatistics } from "../entities/subscription-statistics.entity";
import { DataSource, Repository } from "typeorm";
import * as dayjs from 'dayjs'; // You may need to install this library: npm install dayjs

@Injectable()
export class SubscriptionStatisticsService {
    constructor(
        @InjectRepository(SubscriptionStatistics)
        private readonly subscriptionStatisticsRepository: Repository<SubscriptionStatistics>,
        private readonly dataSource: DataSource,
    ) {}

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
            .select("WEEK(stats.createdAt)", "week")
            .addSelect("YEAR(stats.createdAt)", "year")
            .addSelect("SUM(stats.amount)", "totalAmount")
            .addSelect("COUNT(stats.id)", "transactionCount")
            .groupBy("week, year")
            .orderBy("year, week", "ASC")
            .getRawMany();

        // Monthly Statistics
        const monthlyStats = await this.dataSource.getRepository(SubscriptionStatistics)
            .createQueryBuilder("stats")
            .select("DATE_FORMAT(stats.createdAt, '%Y-%m')", "month")
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