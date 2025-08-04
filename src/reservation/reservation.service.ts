import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Import DataSource for QueryRunner
import { PropertyService } from 'src/property/property.service';
import { UserAuthService } from 'src/user/services/user-auth.service';
import { PaymentCardService } from 'src/payment-card/payment-card.service';

import { Reservation } from './entities/reservation.entity'; // Assuming this is your Reservation entity
import { User } from 'src/user/entities/user.entity'; // User entity
import { Property } from 'src/property/entities/property.entity'; // Property entity

import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateReservationParamDto } from './dto/create-reservation-param.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { SearchPaymentCardDto } from 'src/payment-card/dto/create-payment-card.dto'; // Your DTO for payment card search
import { PropertyStatus } from 'src/property/common/property-status.enum';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>, // Inject Reservation Repository
    @InjectRepository(User) // Inject User Repository to fetch user directly
    private readonly userRepository: Repository<User>,
    // @InjectRepository(Notification) // Inject Notification Repository to fetch Notification directly
    // private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Property) // Inject User Repository to fetch user directly
    private readonly propertyRepository: Repository<Property>,
    private readonly notificationService: NotificationService,
    private readonly paymentCardService: PaymentCardService,
    private readonly userAuthService: UserAuthService, // You might not need this if you inject UserRepository directly
    private readonly propertyService: PropertyService,
    private readonly dataSource: DataSource, // Inject DataSource for transactions
  ) {
  }

  async create(
    userId: string,
    createReservationParamDto: CreateReservationParamDto,
    createReservationDto: CreateReservationDto, // Added payment card info for transaction
  ): Promise<Reservation> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find User
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      // 2. Find Property
      // Using propertyService to get the property details
      const property = await this.propertyRepository.findOne({
        where: { id: createReservationParamDto.id, status: PropertyStatus.Accepted },
        relations: [
          'photos',
          'location',
          'type',
          'licenseDetails',
          'propertyAttributes',
          'propertyAttributes.attribute',
          'owner',
          'office',
          'office.user'
        ],
      });
      if (!property) {
        throw new NotFoundException(`Property with ID ${createReservationParamDto.id} not found.`);
      }

      // 3. Check Property Availability (Simplified example: check for existing reservations on the same date)
      // For a real-world scenario, you'd need more sophisticated date range checks.
      const existingReservation = await queryRunner.manager.findOne(Reservation, {
        where: {
          property: { id: property.id },
          // reservation_date: createReservationDto.reservation_date,
          is_expired: false, // Ensure it's not an expired reservation
        },
      });

      if (existingReservation) {
        throw new BadRequestException(
          `Property ${property.id} is already reserved.`,
        );
      }

      // 4. Process Payment
      // This step uses the transactional method from PaymentCardService
      // searchAndWithdraw is already designed to be transactional internally,
      // but by calling it within this queryRunner, we ensure its operations
      // are part of the larger reservation transaction context if needed,
      // or at least that its success is a prerequisite.
      // NOTE: For true distributed transactions, you might need Sagas or compensating transactions.
      // For now, assume paymentCardService.searchAndWithdraw handles its own transaction or is simple enough.
      // If paymentCardService.searchAndWithdraw uses its OWN queryRunner,
      // it means it's a nested transaction which might commit/rollback independently.
      // For full atomicity with THIS reservation, searchAndWithdraw should use the passed queryRunner or have no transaction itself.
      // Let's modify PaymentCardService temporarily to accept an optional queryRunner for full atomicity.
      await this.paymentCardService.searchAndWithdraw(
        { ...createReservationDto },
        createReservationDto.amount,
        queryRunner.manager
      );

      // 5. Create the Reservation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // Reservation expires 3 days after the reservation date

      const newReservation = queryRunner.manager.create(Reservation, {
        user: user,
        property: property,
        reservation_date: new Date(),
        amount_paid: createReservationDto.amount,
        expires_at: expiresAt,
        is_expired: false, // Initially not expired
        created_at: new Date(),
      });

      property.status = PropertyStatus.Reserved;

      this.notificationService.notifyUser(queryRunner, 

        //omar comment this
        /*property.office.user.id*/ property.office.id, 

        
        "New Reservation", `${user.first_name} ${user.last_name} has reserved a property from yours with this property number:${property.propertyNumber}.`)



      await queryRunner.manager.save(property);


      await queryRunner.manager.save(newReservation);

      await queryRunner.commitTransaction();
      return newReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Reservation creation failed:', error.message);
      throw error; // Re-throw the error for NestJS to handle (e.g., convert to HTTP exception)
    } finally {
      await queryRunner.release();
    }
  }

  // --- Other Methods ---

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      relations: ['user', 'property'], // Load related user and property data
    });
  }

  async findOne(id: string): Promise<Reservation> { // Changed id to string based on UUID
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found.`);
    }
    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.reservationRepository.preload({
      id: id,
      ...updateReservationDto,
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found.`);
    }
    return this.reservationRepository.save(reservation);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reservationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Reservation with ID ${id} not found.`);
    }
  }
}