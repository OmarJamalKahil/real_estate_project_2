import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyAttributeDto } from './create-property-attribute.dto';

export class UpdatePropertyAttributeDto extends PartialType(CreatePropertyAttributeDto) {}
