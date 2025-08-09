import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blog } from "src/blog/entities/blog.entity";
import { OfficeRating } from "./office_rating.entity";
import { Property } from "src/property/entities/property.entity";
import { OfficeSubscription } from "src/office-subscription/entities/office-subscription.entity";
import { OfficeComment } from "src/office-comment/entities/office-comment.entity";
import { EnumStatus } from "src/property/common/property-status.enum";
import { Photo } from "src/common/entities/Photo.entity";
import { LicensePhoto } from "./license_photo.entity";

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
        enum: EnumStatus,
        default: EnumStatus.Pending,
    })
    status: EnumStatus;


    @OneToOne(() => User, { nullable: false })
    @JoinColumn()
    user: User; 


    // Office entity
    @OneToOne(() => OfficeSubscription, (os) => os.office)  
    officeSubscription: OfficeSubscription;

    @OneToOne(() => LicensePhoto)
    @JoinColumn()
    license_photo: LicensePhoto;


    @OneToOne(() => Photo)
    @JoinColumn()
    office_photo: Photo;



    @OneToMany(() => OfficeComment, (officeComment) => officeComment.office, { onDelete: 'CASCADE' })
    comments?: OfficeComment[];

    @OneToMany(() => Blog, (blog) => blog.office)
    blogs?: Blog[];

    @OneToMany(() => OfficeRating, (officeRating) => officeRating.office)
    ratings?: OfficeRating[];

    @OneToMany(() => Property, (property) => property.office)
    properties: Property[];


}
