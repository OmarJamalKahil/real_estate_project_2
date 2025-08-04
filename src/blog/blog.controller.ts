import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors, Req, Put } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'src/common/enums/role.enum';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post("")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileInterceptor('blog_photo'))
  create(
    @Body() createBlogDto: CreateBlogDto,
    @Req() req,
    @UploadedFile() blog_photo?: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.blogService.createBlog(createBlogDto, userId, blog_photo);
  }

  @Get("office")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  getAllBlogsForOffice(
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.blogService.getAllBlogsForOffice(userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileInterceptor('blog_photo'))
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() blog_photo?: Express.Multer.File,
  ) {
    return this.blogService.update(id, updateBlogDto, blog_photo);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    
    const { userId } = req.user;
    console.log(id,userId);
    return this.blogService.remove(id, userId);
  }
}
