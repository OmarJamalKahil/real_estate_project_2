

// src/cloudinary/cloudinary.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed: no result returned'));
          resolve(result);
        },
      );
      // Pipe buffer to Cloudinary
      uploadStream.end(file.buffer);
    });
  }

    async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId,{invalidate: true});
  }
}

