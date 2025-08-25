import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Archive } from "src/archive/entities/archive.entity";
import { Owner } from "src/archive/entities/owner.entity";
import { Property } from "src/property/entities/property.entity";
import { SubscriptionStatistics } from "./entities/subscription-statistics.entity";
import { SubscriptionModule } from "src/subscription/subscription.module";
import { PropertyStatisticsService } from "./services/property-statistics.service";
import { SubscriptionStatisticsService } from "./services/subscription-statistics.service";
import { PropertyStatistics } from "./entities/property-statistics.entity";
import { GeneralStatisticsService } from "./services/general-statistics.service";
import { generalStatistics } from "./entities/general-statistics.entity";


@Module({
    imports: [
        TypeOrmModule.forFeature([
        SubscriptionStatistics,
        PropertyStatistics,
        generalStatistics,
    ]),],
    controllers: [StatisticsController],
    providers: [PropertyStatisticsService, SubscriptionStatisticsService, GeneralStatisticsService],
    exports: [PropertyStatisticsService, SubscriptionStatisticsService, GeneralStatisticsService],
})
export class StatisticsModule { }
