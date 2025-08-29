
// @Injectable()
// export class BlogService {
//   constructor(
//     @InjectRepository(Blog)
//     private readonly blogRepository: Repository<Blog>,

//     @InjectRepository(BlogMedia)
//     private readonly blogMediaRepository: Repository<BlogMedia>,

//     @InjectRepository(Office)
//     private readonly officeRepository: Repository<Office>,

//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,

//     private readonly cloudinaryService: CloudinaryService,

//     private readonly dataSource: DataSource,
//   ) { }

//   // 🟢 CREATE
//   async createBlog(
//     createBlogDto: CreateBlogDto,
//     userId: string,
//     file?: Express.Multer.File,
//   ): Promise<Blog> {

//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
//       if (!user) throw new NotFoundException('User not found');

//       const office = await queryRunner.manager.findOne(Office, { where: { user } });
//       if (!office) throw new NotFoundException('Office not found');

//       if (file) {
//         const uploadResult = await this.cloudinaryService.uploadImage(file);
//         const blogMedia = this.blogMediaRepository.create({
//           url: uploadResult.url,
//           public_id: uploadResult.public_id,
//         });

//         await queryRunner.manager.save(blogMedia);
//       }


//       const blog = this.blogRepository.create({
//         title: createBlogDto.title,
//         content: createBlogDto.content,
//         office,

//       });

//       const savedBlog = await queryRunner.manager.save(blog);


//       await queryRunner.commitTransaction();
//       return savedBlog;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to create blog');
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   // 🔵 READ ALL
//   async findAll(): Promise<Blog[]> {
//     return this.blogRepository.find({ relations: ['office'] });
//   }

//   async getAllBlogsForOffice(userId: string): Promise<Blog[]> {
//     return this.blogRepository.find({
//       where: {
//         office: {
//           user: {
//             id: userId
//           }
//         }
//       }, relations: ['office']
//     });

//   }

//   // 🔵 READ ONE
//   async findOne(id: string): Promise<Blog> {
//     const blog = await this.blogRepository.findOne({
//       where: { id },
//       relations: ['office'],
//     });
//     if (!blog) throw new NotFoundException('Blog not found');
//     return blog;
//   }

//   // 🟠 UPDATE
//   async update(id: string, updateBlogDto: UpdateBlogDto, file?: Express.Multer.File): Promise<Blog> {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const blog = await queryRunner.manager.findOne(Blog, { where: { id } });
//       if (!blog) throw new NotFoundException('Blog not found');

//       Object.assign(blog, updateBlogDto);
//       await queryRunner.manager.save(blog);

//       if (file) {

//         let blogMedia = await queryRunner.manager.findOne(BlogMedia, { where: { blog: { id } } });

//         if (blogMedia) {
//           await this.cloudinaryService.deleteImage(blogMedia.public_id)
//         }

//         const uploadResult = await this.cloudinaryService.uploadImage(file);


//         blogMedia = this.blogMediaRepository.create({
//           url: uploadResult.url,
//           public_id: uploadResult.public_id,
//           blog,
//         });

//         // if (blogMedia) {
//         //   blogMedia.url = uploadResult.url;
//         //   blogMedia.public_id = uploadResult.public_id;
//         // } else {
//         //   blogMedia = this.blogMediaRepository.create({
//         //     url: uploadResult.url,
//         //     public_id: uploadResult.public_id,
//         //     blog,
//         //   });
//         // }

//         await queryRunner.manager.save(blogMedia);
//       }

//       await queryRunner.commitTransaction();
//       return blog;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to update blog');
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   // 🔴 DELETE
//   async remove(id: string, userId: string): Promise<void> {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const blog = await queryRunner.manager.findOne(Blog, {
//         where: {
//           office: {
//             user: {
//               id: userId
//             }
//           }, id
//         }
//       });
//       if (!blog) throw new NotFoundException('Blog not found');

//       const blogMedia = await queryRunner.manager.findOne(BlogMedia, { where: { blog: { id } } });

//       if (blogMedia) {
//         await queryRunner.manager.remove(blogMedia);
//         await this.cloudinaryService.deleteImage(blogMedia.public_id);
//       }

//       await queryRunner.manager.remove(blog);

//       await queryRunner.commitTransaction();
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to delete blog');
//     } finally {
//       await queryRunner.release();
//     }
//   }
// }


import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, And } from 'typeorm';

import { Blog } from './entities/blog.entity';
import { BlogMedia } from './entities/blog_media.entity';
import { Office } from 'src/office/entities/office.entity';
import { User } from 'src/user/entities/user.entity';

import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationDto } from 'src/common/utils/pagination.dto';
import { PaginatedResponse } from 'src/common/utils/paginated-response.interface';



@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,

    @InjectRepository(BlogMedia)
    private readonly blogMediaRepository: Repository<BlogMedia>,

    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
  ) { }

  // CREATE
  async createBlog(createBlogDto: CreateBlogDto, userId: string, file?: Express.Multer.File): Promise<Blog> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const office = await queryRunner.manager.findOne(Office, {
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (!office) throw new NotFoundException('Office not found');

      let blogMedia: BlogMedia | undefined;

      if (file) {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        blogMedia = this.blogMediaRepository.create({
          url: uploadResult.url,
          public_id: uploadResult.public_id,
        });
        await queryRunner.manager.save(blogMedia);
      }

      const blog = this.blogRepository.create({
        title: createBlogDto.title,
        content: createBlogDto.content,
        office,
        blog_media: blogMedia,
      });

      const savedBlog = await queryRunner.manager.save(blog);

      await queryRunner.commitTransaction();
      return savedBlog;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create blog');
    } finally {
      await queryRunner.release();
    }
  }

  // // FIND ALL
  // async findAll(
  //   paginationDto:PaginationDto
  // ): Promise<PaginatedResponse<Blog[]>> {
  //   return this.blogRepository.find({
  //     relations: ['office', 'blog_media'],
  //   });
  // }


   async findAll(
    paginationDto: PaginationDto
  ): Promise<PaginatedResponse<Blog>> {
    const { page = 0, limit = 0 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.blogRepository.findAndCount({
      relations: ['office', 'blog_media'],
      take: limit,
      skip: skip,
    });

    const pageCount = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      pageCount,
    };
  }

  async getAllBlogsForOffice(userId: string): Promise<Blog[]> {
    return this.blogRepository.find({
      where: {
        office: {
          user: { id: userId },
        },
      },
      relations: ['office', 'blog_media'],
    });
  }

  // FIND ONE
  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['office', 'blog_media'],
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  // UPDATE
  async update(id: string, updateBlogDto: UpdateBlogDto, file?: Express.Multer.File): Promise<Blog> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const blog = await queryRunner.manager.findOne(Blog, {
        where: { id },
        relations: ['blog_media'],
      });
      if (!blog) throw new NotFoundException('Blog not found');

      Object.assign(blog, updateBlogDto);
      await queryRunner.manager.save(blog);

      if (file) {
        if (blog.blog_media) {
          await this.cloudinaryService.deleteImage(blog.blog_media.public_id);
          await queryRunner.manager.remove(BlogMedia, blog.blog_media);
        }

        const uploadResult = await this.cloudinaryService.uploadImage(file);
        const newBlogMedia = this.blogMediaRepository.create({
          url: uploadResult.url,
          public_id: uploadResult.public_id,
        });
        await queryRunner.manager.save(newBlogMedia);

        blog.blog_media = newBlogMedia;
        await queryRunner.manager.save(blog);
      }

      await queryRunner.commitTransaction();
      return blog;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to update blog');
    } finally {
      await queryRunner.release();
    }
  }




  async remove(id: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const blog = await queryRunner.manager
        .createQueryBuilder(Blog, 'blog')
        .leftJoinAndSelect('blog.office', 'office')
        .leftJoinAndSelect('office.user', 'user')
        .leftJoinAndSelect('blog.blog_media', 'blog_media')
        .where('blog.id = :id', { id })
        .andWhere('user.id = :userId', { userId })
        .getOne();

      if (!blog) throw new NotFoundException('Blog not found');

      await queryRunner.manager.remove(blog);

      
      if (blog.blog_media) {
        console.log("blog_media", blog.blog_media);

        await this.cloudinaryService.deleteImage(blog.blog_media.public_id);

        await queryRunner.manager.remove(BlogMedia, blog.blog_media);
      }


      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to delete blog');
    } finally {
      await queryRunner.release();
    }
  }




}
