import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogMedia } from './entities/blog_media.entity';
import { Office } from 'src/office/entities/office.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    CloudinaryModule,
    TypeOrmModule.forFeature([Blog, BlogMedia, Office, User])
  ],

  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],

})
export class BlogModule { }
