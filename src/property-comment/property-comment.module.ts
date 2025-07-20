import { Module } from '@nestjs/common';
import { PropertyCommentService } from './property-comment.service';
import { PropertyCommentController } from './property-comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyComment } from './entities/property-comment.entity';
import { Property } from 'src/property/entities/property.entity';
import { UserModule } from 'src/user/user.module';
import { PropertyModule } from 'src/property/property.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyComment, Property,
    ]),
    UserModule,
    PropertyModule,
  ],
  controllers: [PropertyCommentController],
  providers: [PropertyCommentService],
})
export class PropertyCommentModule { }
