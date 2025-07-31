import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { PropertyCommentService } from './property-comment.service';
import { CreatePropertyCommentDto } from './dto/create-property-comment.dto';
import { UpdatePropertyCommentDto } from './dto/update-property-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('property-comment')
export class PropertyCommentController {
  constructor(private readonly propertyCommentService: PropertyCommentService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createPropertyCommentDto: CreatePropertyCommentDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.propertyCommentService.create(userId, createPropertyCommentDto);
  }

  @Get()
  findAll() {
    return this.propertyCommentService.findAll();
  }

  @Get('property/:id')
  findAllByOfficeId(@Param('id') id: string) {
    return this.propertyCommentService.findAllByPropertyId(id);
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePropertyCommentDto: UpdatePropertyCommentDto,
    @Req() req,
  ) {
    const { userId } = req.user;

    return this.propertyCommentService.update(userId, id, updatePropertyCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.propertyCommentService.remove(userId, id);
  }

}

