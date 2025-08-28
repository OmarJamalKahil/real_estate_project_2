import { Module } from "@nestjs/common";
import { ArchiveController } from "./archive.controller";
import {ArchiveService} from "src/archive/archive.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Archive } from "./entities/archive.entity";
import { StatisticsModule } from "src/statistics/statistics.module";
import { Record } from "./entities/record.entity";
import { Location } from "src/property/entities/location.entity";


@Module({
    imports:[TypeOrmModule.forFeature([Archive, Record, Location]), StatisticsModule],
    controllers:[ArchiveController],
    providers:[ArchiveService],
    exports:[ArchiveService]
})
export class ArchiveModule{}