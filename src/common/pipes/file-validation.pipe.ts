import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File too large');
    }

    return file;
  }
}
