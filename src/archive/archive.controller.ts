import { Controller, Get, Inject, Post } from "@nestjs/common";
import { CreateArchiveDto } from "./dto/create_Archive.dto";
import { OwnerDto } from "./dto/owner.dto";
import { ClientDto } from "./dto/client.dto";
import { ArchiveService } from "./archive.service";


@Controller('archive')
export class ArchiveController{

    constructor(
        private readonly archiveService: ArchiveService
    ){}

    @Post()
    public async addPropertyToArchive(
        createArchiveDto: CreateArchiveDto,
        ownerDto: OwnerDto,
        clientDto: ClientDto
    ){
        return this.archiveService.addPropertyToArchive(
            createArchiveDto,
            ownerDto,
            clientDto
        )
    }


    @Get()
    public getOneArchive(){}
}