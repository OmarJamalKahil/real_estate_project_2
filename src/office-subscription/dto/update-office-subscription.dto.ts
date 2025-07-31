import { PartialType } from '@nestjs/mapped-types';
import { CreateOfficeSubscriptionDto } from './create-office-subscription.dto';

export class UpdateOfficeSubscriptionDto extends PartialType(CreateOfficeSubscriptionDto) {}
