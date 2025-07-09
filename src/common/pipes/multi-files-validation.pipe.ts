import {
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class MultiFileValidationPipe implements PipeTransform {
  transform(
    files: {
      [fieldname: string]: Express.Multer.File[];
    }
  ) {
    const validMimetypes = ['image/png', 'image/jpeg','image/jpg'];
    const maxFileSize = 2 * 1024 * 1024; // 2 MB

    // loop through each named field
    for (const field in files) {
      const fileArray = files[field];
      if (!fileArray || fileArray.length === 0) {
        throw new BadRequestException(`${field} is required`);
      }

      fileArray.forEach((file) => {
        if (!validMimetypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Unsupported file type for ${field}. Allowed: ${validMimetypes.join(', ')}`
          );
        }
        if (file.size > maxFileSize) {
          throw new BadRequestException(
            `${field} is too large. Max size 2MB.`
          );
        }
      });
    }

    return files;
  }
}
