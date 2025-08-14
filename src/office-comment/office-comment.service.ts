import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OfficeComment } from './entities/office-comment.entity';
import { Office } from 'src/office/entities/office.entity';
import { UserAuthService } from 'src/user/services/user-auth.service';
import { CreateOfficeCommentDto } from './dto/create-office-comment.dto';
import { UpdateOfficeCommentDto } from './dto/update-office-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OfficeRating } from 'src/office/entities/office_rating.entity';

@Injectable()
export class OfficeCommentService {
  constructor(
    @InjectRepository(OfficeComment)
    private readonly officeCommentRepository: Repository<OfficeComment>,
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,


    //Office Rating Repo is new
    @InjectRepository(OfficeRating)
    private readonly officeRatingRepository: Repository<OfficeRating>,


    private readonly userAuthService: UserAuthService,
    private readonly dataSource: DataSource,
  ) { }

  async create(userId: string, createOfficeCommentDto: CreateOfficeCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //const { officeId, content } = createOfficeCommentDto;

      const { officeId, officeRatingId, content } = createOfficeCommentDto;

      const user = await this.userAuthService.getUser(userId);
      if (!user) throw new NotFoundException('User not found');

      const office = await this.officeRepository.findOne({
        where: { id: officeId },
      });
      if (!office) throw new NotFoundException('Office not found');

      // from here
      const officeRating = await this.officeRatingRepository.findOne({
        where: {id: officeRatingId},
      });

      if(!officeRating)
        throw new NotFoundException('you have to give a rating then comment');
      // to here is new

      const comment = queryRunner.manager.create(OfficeComment, {
        content,
        user,
        office,

        // these rate and date are new
        rate: officeRating,
        date: new Date()
      });

      await queryRunner.manager.save(comment);
      await queryRunner.commitTransaction();

      return comment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.officeCommentRepository.find({
      relations: ['user', 'office'],
      order: { id: 'DESC' },
    });
  }

  // async findAllByOfficeId(officeId: string) {
  //   const office = await this.officeRepository.findOne({ where: { id: officeId } });
  //   if (!office) throw new NotFoundException('Office not found');

  //   return this.officeCommentRepository.find({
  //     where: { office: { id: officeId } },
  //     relations: ['user'],
  //     order: { id: 'DESC' },
  //   });
  // }

  // this func is an anhanced version of the above func
  async findAllByOfficeId(officeId: string) {
  const office = await this.officeRepository.findOne({ where: { id: officeId } });
  if (!office) throw new NotFoundException('Office not found');

  const comments = await this.officeCommentRepository
  .createQueryBuilder('comment')
  .select([
    'comment.id',
    'comment.content',
    'comment.date',
    'user.id',
    'user.first_name',
    'user.last_name',
    'rate.rating',
    'profilePhoto.url',    // رابط الصورة (لو عندك عمود url)
  ])
  .leftJoin('comment.user', 'user')
  .leftJoin('comment.rate', 'rate')
  .leftJoin('user.profile_photo', 'profilePhoto')
  .where('comment.officeId = :officeId', { officeId })
  .orderBy('comment.id', 'DESC')
  .getMany();

  return comments;
}

  async findOne(id: string) {
    const comment = await this.officeCommentRepository.findOne({
      where: { id },
      relations: ['user', 'office'],
    });

    if (!comment) throw new NotFoundException('Office comment not found');
    return comment;
  }

  async update(userId: string, officeId: string, updateOfficeCommentDto: UpdateOfficeCommentDto) {
    const comment = await this.officeCommentRepository.findOne({ where: { id: officeId, user: { id: userId } } });

    if (!comment) throw new NotFoundException('Office comment not found');

    // Object.assign(comment, updateOfficeCommentDto);
    comment.content = updateOfficeCommentDto.content;
    return this.officeCommentRepository.save(comment);
  }

  async remove(userId: string, officeId: string) {
    const comment = await this.officeCommentRepository.findOne({
      where: {
        id: officeId, user: {
          id: userId
        }
      }
    });

    if (!comment) throw new NotFoundException('Office comment not found');

    await this.officeCommentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
