import { forwardRef, Module } from '@nestjs/common';
import { FavoriteOfficeService } from './favorite-office.service';
import { FavoriteOfficeController } from './favorite-office.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteOffice } from './entities/favorite-office.entity';
import { OfficeModule } from 'src/office/office.module';
import { Office } from 'src/office/entities/office.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      FavoriteOffice,Office
    ]),
    OfficeModule,
    UserModule,
  ],
  controllers: [FavoriteOfficeController],
  providers: [FavoriteOfficeService],
  exports: [FavoriteOfficeService],
})
export class FavoriteOfficeModule {}
