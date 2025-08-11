import { Module } from "@nestjs/common";
import { ArchiveController } from "./archive.controller";
import {ArchiveService} from "src/archive/archive.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Archive } from "./entities/archive.entity";
import { Owner } from "./entities/owner.entity";
import { Client } from "./entities/client.entity";
import { StatisticsModule } from "src/statistics/statistics.module";


@Module({
    imports:[TypeOrmModule.forFeature([Archive, Owner, Client]), StatisticsModule],
    controllers:[ArchiveController],
    providers:[ArchiveService],
    exports:[ArchiveService]
})
export class ArchiveModule{}