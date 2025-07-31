import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { GeneralStatisticsService } from "./services/general_statistics.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GeneralStatistics } from "./entities/general_statistics.entity";
import { Archive } from "src/archive/entities/archive.entity";
import { Owner } from "src/archive/entities/owner.entity";
import { Property } from "src/property/entities/property.entity";


@Module({
    imports:[TypeOrmModule.forFeature([GeneralStatistics , Archive , Owner, Property])],
    controllers: [StatisticsController],
    exports:[GeneralStatisticsService],
    providers:[GeneralStatisticsService]
})
export class StatisticsModule{}
