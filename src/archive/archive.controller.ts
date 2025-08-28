import { Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { CreateArchiveDto } from './dto/create_Archive.dto';
import { ArchiveService } from './archive.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/user/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  public getAllArchive() {
    return this.archiveService.getAllArchive();
  }

  @Get('/:archiveId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  public getOneArchiveWithRecords(@Param('archiveId') archiveId: string) {
    return this.archiveService.getOneArchiveWithRecords(archiveId);
  }
}
