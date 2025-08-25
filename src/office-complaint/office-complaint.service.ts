import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfficeComplaint } from './entities/office-complaint.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOfficeComplaintDto } from './dto/create-office-complaint.dto';
import { OfficeComplaintPhoto } from './entities/office-complaint-photo.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Office } from 'src/office/entities/office.entity';
import { Role, User } from 'src/user/entities/user.entity';

@Injectable()
export class OfficeComplaintService {
  constructor(
    @InjectRepository(OfficeComplaint)
    private readonly officeComplaintRepo: Repository<OfficeComplaint>,

    @InjectRepository(Office)
    private readonly officeRepo: Repository<Office>,

    @InjectRepository(OfficeComplaintPhoto)
    private readonly officeComplaintPhotoRepo: Repository<OfficeComplaintPhoto>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createComplaint(
    userId: string,
    createOfficeComplaintDto: CreateOfficeComplaintDto,
    complaint_midea: Express.Multer.File[],
  ) {
    const office = await this.officeRepo.findOne({
      where: { id: createOfficeComplaintDto.officeId },
    });

    if (office == null) {
      throw new NotFoundException('Office not found');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (user == null) {
      throw new NotFoundException('User not found');
    }

    var officeComplaint = await this.officeComplaintRepo.findOne({
      where: { user: { id: userId }, office: { id: office.id } },
    });

    if (officeComplaint) {
      throw new ForbiddenException("You can't make more than one complaint");
    }

    officeComplaint = await this.officeComplaintRepo.create({
      office: office,
      user: user,
      content: createOfficeComplaintDto.content,
      title: createOfficeComplaintDto.title,
      date: new Date(),
      officeComplaintPhotos: [],
    });

    await this.officeComplaintRepo.save(officeComplaint);

    const photos: OfficeComplaintPhoto[] = [];
    for (const file of complaint_midea) {
      const uploadRes = await this.cloudinaryService.uploadImage(file);
      const photo = this.officeComplaintPhotoRepo.create({
        officeComplaint,
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      });
      await this.officeComplaintPhotoRepo.save(photo);
      photos.push(photo);
    }

    officeComplaint.officeComplaintPhotos = photos;

    await this.officeComplaintRepo.save(officeComplaint);

    return { message: 'The complaint has been added successfully' };
  }

  async getAllOfficeComplaints(userId: string) {
    const office = await this.officeComplaintRepo.find({
      where: { office: { user: { id: userId } } },
      relations: ['user', 'officeComplaintPhotos'],
    });

    return office;
  }

  async getAllOfficeComplaintsForUser(userId: string) {
    return await this.officeComplaintRepo.find({
      where: { user: { id: userId } },
      relations: ['office', 'officeComplaintPhotos'],
    });
  }

  async deleteOfficeComplaint(userId: string, complaintId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let officeComplaint: any;

    if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
      officeComplaint = await this.officeComplaintRepo.findOne({
        where: { id: complaintId },
      });
    } else if (user.role === Role.USER) {
      officeComplaint = await this.officeComplaintRepo.findOne({
        where: { user: { id: userId }, id: complaintId },
      });
    }

    if (!officeComplaint) {
      throw new NotFoundException(
        'No complaint found for this office with the given criteria',
      );
    }

    await this.officeComplaintRepo.delete(officeComplaint.id);

    return { message: 'The complaint deleted successfully' };
  }
}
