import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateRecordDto } from 'src/archive/dto/create-record.dto';
import { CreateArchiveDto } from 'src/archive/dto/create_Archive.dto';

export class CreateFullPropertyRequestDto {
  @Transform(({ value }) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Object.assign(new CreateArchiveDto(), parsed);
    } catch {
      return new CreateArchiveDto(); // empty object with correct class type
    }
  })
  @ValidateNested()
  @Type(() => CreateArchiveDto)
  createArchiveDto: CreateArchiveDto;

  @Transform(({ value }) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Object.assign(new CreateRecordDto(), parsed);
    } catch {
      return new CreateRecordDto(); // empty object with correct class type
    }
  })
  @ValidateNested()
  @Type(() => CreateRecordDto)
  createRecordDto: CreateRecordDto;
}
