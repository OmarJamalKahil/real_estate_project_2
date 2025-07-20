import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoritePropertyDto } from './create-favorite-property.dto';

export class UpdateFavoritePropertyDto extends PartialType(CreateFavoritePropertyDto) {}
