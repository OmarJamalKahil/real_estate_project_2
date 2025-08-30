import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Office } from 'src/office/entities/office.entity';
import { Role, User } from 'src/user/entities/user.entity';
import { PropertyComplaint } from './entities/property-complaint.entity';
import { Property } from 'src/property/entities/property.entity';
import { PropertyComplaintPhoto } from './entities/property-complaint-photo.entity';
import { CreatePropertyComplaintDto } from './dto/create-property-complaint.dto';

@Injectable()
export class PropertyComplaintService {
  constructor(
    @InjectRepository(PropertyComplaint)
    private readonly propertyComplaintRepo: Repository<PropertyComplaint>,

    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,

    @InjectRepository(PropertyComplaintPhoto)
    private readonly propertyComplaintPhotoRepo: Repository<PropertyComplaintPhoto>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async createComplaint(
    userId: string,
    createPropertyComplaintDto: CreatePropertyComplaintDto,
    complaint_midea: Express.Multer.File[],
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id: createPropertyComplaintDto.propertyId },
    });

    if (property == null) {
      throw new NotFoundException('Office not found');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (user == null) {
      throw new NotFoundException('User not found');
    }

    var propertyComplaint = await this.propertyComplaintRepo.findOne({
      where: { user: { id: userId }, property: { id: property.id } },
    });

    if (propertyComplaint) {
      throw new ForbiddenException("You can't make more than one complaint");
    }

    propertyComplaint = await this.propertyComplaintRepo.create({
      property: property,
      user: user,
      content: createPropertyComplaintDto.content,
      title: createPropertyComplaintDto.title,
      date: new Date(),
      propertyComplaintPhotos: [],
    });

    await this.propertyComplaintRepo.save(propertyComplaint);

    const photos: PropertyComplaintPhoto[] = [];
    for (const file of complaint_midea) {
      const uploadRes = await this.cloudinaryService.uploadImage(file);
      const photo = this.propertyComplaintPhotoRepo.create({
        propertyComplaint,
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      });
      await this.propertyComplaintPhotoRepo.save(photo);
      photos.push(photo);
    }

    propertyComplaint.propertyComplaintPhotos = photos;

    await this.propertyComplaintRepo.save(propertyComplaint);

    return { message: 'The complaint has been added successfully' };
  }

  async getAllPropertyComplaints() {
    const office = await this.propertyComplaintRepo.find({
      relations: ['user', 'propertyComplaintPhotos', 'property','property.office','property.office.user'],
    });

    return office;
  }

  async getAllPropertyComplaintsForOffice(userId: string) {
    const office = await this.propertyComplaintRepo.find({
      where: { property: { office: { user: { id: userId } } } },
      relations: ['user', 'propertyComplaintPhotos',         
        'property',
        'propertyComplaintPhotos',
        'property.office',
        'property.type',
        'property.photos',
        'property.licenseDetails',
        'property.location',],
    });

    return office;
  }

  async getAllPropertyComplaintsForUser(userId: string) {
    return await this.propertyComplaintRepo.find({
      where: { user: { id: userId } },
      relations: [
        'property',
        'propertyComplaintPhotos',
        'property.office',
        'property.type',
        'property.photos',
        'property.licenseDetails',
        'property.location',
      ],
    });
  }

  async deletePropertyComplaint(userId: string, complaintId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let propertyComplaint;

    if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
      propertyComplaint = await this.propertyComplaintRepo.findOne({
        where: { id: complaintId },
      });
    } else if (user.role === Role.USER) {
      propertyComplaint = await this.propertyComplaintRepo.findOne({
        where: { id: complaintId, user: { id: userId } },
      });
    }

    if (!propertyComplaint) {
      throw new NotFoundException(
        'No complaint found for this property with the given criteria',
      );
    }

    await this.propertyComplaintRepo.delete(propertyComplaint.id);

    return { message: 'The complaint deleted successfully' };
  }
}
