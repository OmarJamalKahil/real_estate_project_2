import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export async function validateDto<T extends object>(dtoClass: new () => T, plainData: any): Promise<T> {
  const instance = plainToInstance(dtoClass, plainData);

  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => {
        const constraints = err.constraints
          ? Object.values(err.constraints).join(', ')
          : 'No constraints';
        return `${err.property}: ${constraints}`;
      })
      .join('; ');

    throw new BadRequestException(`Validation failed: ${errorMessages}`);
  }

  return instance;
}
