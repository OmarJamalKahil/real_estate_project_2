import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Upload } from './upload.entity';
import { Banned } from './banned.entity';
import { Warning } from './warning.entity';
import { UserWarnings } from './user-warnings.entity';
import { Property } from 'src/property/entities/property.entity';
import { PaymentCard } from 'src/payment-card/entities/payment-card.entity';
import { OfficeComment } from 'src/office-comment/entities/office-comment.entity';
import { Office } from 'src/office/entities/office.entity';
import { FavoriteOffice } from 'src/favorite-office/entities/favorite-office.entity';
import { FavoriteProperty } from 'src/favorite-property/entities/favorite-property.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Role } from 'src/common/enums/role.enum';



@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column(
        {
            nullable: true
        }
    )
    first_name: string;

    @Column({
        nullable: true
    })
    last_name: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false, unique: true })
    phone: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    receiver_identifier: string;

    @Column(
        { nullable: true }
    )
    verify_code: string;

    @Column({
        nullable: false,
        default: false
    })
    is_verified: boolean

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Column({ nullable: true })
    national_number: string;

    @OneToOne(() => Upload, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
    @JoinColumn()
    profile_photo?: Upload;

    @OneToOne(() => Banned, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    banned?: Banned;


    @OneToOne(() => UserWarnings, userWarnings => userWarnings.user, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    userWarnings?: UserWarnings;

    @OneToMany(() => Property, (property) => property.owner)
    properties: Property[];


    @OneToMany(() => OfficeComment, (officeComment) => officeComment.user)
    comments?: OfficeComment[];

    @OneToMany(() => FavoriteOffice, (favoriteOffice) => favoriteOffice.user)
    favoriteOffices?: FavoriteOffice[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications?:Notification[];


    @OneToMany(() => FavoriteProperty, (favoriteProperty) => favoriteProperty.user)
    favoriteProperties?: FavoriteProperty[];

    @OneToMany(() => Reservation, (reservation) => reservation.user)
    reservations:Reservation[];
}  
