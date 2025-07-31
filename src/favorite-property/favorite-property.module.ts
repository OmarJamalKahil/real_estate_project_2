import { Module } from '@nestjs/common';
import { FavoritePropertyService } from './favorite-property.service';
import { FavoritePropertyController } from './favorite-property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteProperty } from './entities/favorite-property.entity';
import { Property } from 'src/property/entities/property.entity';
import { PropertyModule } from 'src/property/property.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[
        TypeOrmModule.forFeature([
          FavoriteProperty,Property
        ]),
        PropertyModule,
        UserModule,
  ],
  controllers: [FavoritePropertyController],
  providers: [FavoritePropertyService],
  exports: [FavoritePropertyService],
})
export class FavoritePropertyModule {}
