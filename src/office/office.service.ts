import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from './entities/office.entity';
import { DataSource, Repository } from 'typeorm';
import { LicensePhoto } from './entities/license_photo.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';

@Injectable()
export class OfficeService {

  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(LicensePhoto)
    private readonly licensePhotoRepository: Repository<LicensePhoto>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
  ) { }

  async create(createOfficeDto: CreateOfficeDto, license_photo: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Upload to cloudinary
      const uploadedImage = await this.cloudinaryService.uploadImage(license_photo);

      // Create LicensePhoto
      const licensePhoto = this.licensePhotoRepository.create({
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      });

      await queryRunner.manager.save(licensePhoto);

      // Create Office entity
      const office = this.officeRepository.create({
        ...createOfficeDto,
        license_photo: licensePhoto,
      });

      await queryRunner.manager.save(office);

      await queryRunner.commitTransaction();
      return office;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async findAll() {
    return this.officeRepository.find({
      relations: ['license_photo', 'officeSubscription', 'user', 'blogs'],
    });
  }

  async findOne(id: string) {
    return this.officeRepository.findOne({
      where: { id },
      relations: ['license_photo', 'officeSubscription', 'user', 'blogs'],
    });
  }


  async update(id: string, updateOfficeDto: UpdateOfficeDto, license_photo?: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeRepository.findOne({
        where: { id },
        relations: ['license_photo'],
      });

      if (!office) {
        throw new NotFoundException('Office not found');
      }

      // If new photo uploaded, update the photo
      if (license_photo) {
        // Delete old photo from Cloudinary
        if (office.license_photo?.public_id) {
          await this.cloudinaryService.deleteImage(office.license_photo.public_id);
        }

        const uploadedImage = await this.cloudinaryService.uploadImage(license_photo);

        office.license_photo.url = uploadedImage.secure_url;
        office.license_photo.public_id = uploadedImage.public_id;
        await queryRunner.manager.save(office.license_photo);
      }

      // Update other fields
      Object.assign(office, updateOfficeDto);
      await queryRunner.manager.save(office);

      await queryRunner.commitTransaction();
      return office;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updatingStatus(id: string, updateOfficeStatusDto: UpdateOfficeStatusDto){

     const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeRepository.findOne({
        where: { id },
        relations: ['license_photo'],
      });

      if (!office) {
        throw new NotFoundException('Office not found');
      }

      // Update other fields
      Object.assign(office, updateOfficeStatusDto);
      await queryRunner.manager.save(office);

      await queryRunner.commitTransaction();
      return office;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }


  }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeRepository.findOne({
        where: { id },
        relations: ['license_photo'],
      });

      if (!office) {
        throw new NotFoundException('Office not found');
      }

      if (office.license_photo?.public_id) {
        await this.cloudinaryService.deleteImage(office.license_photo.public_id);
      }

      await queryRunner.manager.remove(office);
      await queryRunner.commitTransaction();
      return { message: 'Office deleted successfully' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

}
