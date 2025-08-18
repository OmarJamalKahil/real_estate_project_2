import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { OfficeCommentService } from './office-comment.service';
import { CreateOfficeCommentDto } from './dto/create-office-comment.dto';
import { UpdateOfficeCommentDto } from './dto/update-office-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaginationDto } from 'src/common/utils/pagination.dto';

@Controller('office-comment')
export class OfficeCommentController {
  constructor(private readonly officeCommentService: OfficeCommentService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createOfficeCommentDto: CreateOfficeCommentDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.officeCommentService.create(userId, createOfficeCommentDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.officeCommentService.findAll(
      paginationDto
    );
  }

  @Get('office/:id')
  findAllByOfficeId(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.officeCommentService.findAllByOfficeId(id, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officeCommentService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateOfficeCommentDto: UpdateOfficeCommentDto,
    @Req() req,
  ) {
    const { userId } = req.user;

    return this.officeCommentService.update(userId, id, updateOfficeCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.officeCommentService.remove(userId, id);
  }
}
