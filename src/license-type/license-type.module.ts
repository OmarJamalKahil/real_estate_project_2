import { Module } from '@nestjs/common';
import { LicenseTypeService } from './license-type.service';
import { LicenseTypeController } from './license-type.controller';

@Module({
  controllers: [LicenseTypeController],
  providers: [LicenseTypeService],
})
export class LicenseTypeModule {}
