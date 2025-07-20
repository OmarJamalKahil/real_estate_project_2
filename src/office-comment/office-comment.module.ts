import { Module } from '@nestjs/common';
import { OfficeCommentService } from './office-comment.service';
import { OfficeCommentController } from './office-comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeComment } from './entities/office-comment.entity';
import { UserModule } from 'src/user/user.module';
import { OfficeModule } from 'src/office/office.module';
import { Office } from 'src/office/entities/office.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      OfficeComment,Office
    ]),
    UserModule,
    OfficeModule,
  ],
  controllers: [OfficeCommentController],
  providers: [OfficeCommentService],
  exports:[OfficeCommentService]
})
export class OfficeCommentModule {} 
