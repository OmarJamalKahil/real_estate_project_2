import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { LicensePhoto } from "./license_photo.entity";
import { Blog } from "src/blog/entities/blog.entity";
import { OfficeRating } from "./office_rating.entity";
import { OfficePhoto } from "./office_photo.entity";
import { Property } from "src/property/entities/property.entity";
import { OfficeSubscription } from "src/office-subscription/entities/office-subscription.entity";
import { OfficeComment } from "src/office-comment/entities/office-comment.entity";


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


    // Office entity
    @OneToOne(() => OfficeSubscription, (os) => os.office)
    officeSubscription: OfficeSubscription;

    @OneToOne(() => LicensePhoto)
    @JoinColumn()
    license_photo: LicensePhoto;


    @OneToOne(() => OfficePhoto)
    @JoinColumn()
    office_photo: OfficePhoto;



    @OneToMany(() => OfficeComment, (officeComment) => officeComment.office, { onDelete: 'CASCADE' })
    comments?: OfficeComment[];

    @OneToMany(() => Blog, (blog) => blog.office)
    blogs?: Blog[];

    @OneToMany(() => OfficeRating, (officeRating) => officeRating.office)
    ratings?: OfficeRating[];

    @OneToMany(() => Property, (property) => property.office)
    properties: Property[];


}
