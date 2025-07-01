import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { LicensePhoto } from "./license_photo.entity";
import { Blog } from "src/blog/entities/blog.entity";
import { OfficeSubscription } from "./office_subscription.entity";
import { OfficeRating } from "./office_rating.entity";
import { OfficePhoto } from "./office_photo.entity";


export enum OfficeCreatingStatus {
    pending = 'pending',
    accepted = 'accepted',
    rejected = 'rejected',
}

@Entity()
export class Office {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        nullable: false
    })
    name: string;


    @Column({
        nullable: false
    })
    office_email: string;


    @Column({
        nullable: false
    })
    office_phone: string;

    @Column({
        nullable: false,
        unique: true,
    })
    license_number: string;


    @Column({
        nullable: false,
        unique: true,
    })
    personal_identity_number: string

    @Column({
        type: 'enum',
        enum: OfficeCreatingStatus,
        default: OfficeCreatingStatus.pending,
    })
    status: OfficeCreatingStatus;

    
    @OneToOne(() => User, { nullable: false })
    @JoinColumn()
    user: User;

    @OneToOne(() => OfficeSubscription)
    @JoinColumn()
    officeSubscription?: OfficeSubscription;

    @OneToOne(() => LicensePhoto)
    @JoinColumn()
    license_photo: LicensePhoto;


    @OneToOne(() => OfficePhoto)
    @JoinColumn()
    office_photo: OfficePhoto;


    @OneToMany(() => Blog, (blog) => blog.office)
    blogs?: Blog[];

    @OneToMany(() => OfficeRating, (officeRating) => officeRating.office)
    ratings?: OfficeRating[];



}
