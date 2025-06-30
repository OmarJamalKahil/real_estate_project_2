import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { LicensePhoto } from "./license_photo.entity";
import { Blog } from "src/blog/entities/blog.entity";
import { OfficeSubscription } from "./office_subscription.entity";


export enum OfficeCreatingStatus {
    pending = 'pending',
    accepted = 'accepted',
    rejected = 'rejected',
}

@Entity()
export class Office {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @OneToOne(() => OfficeSubscription)
    @JoinColumn()
    officeSubscription?: OfficeSubscription;

    @OneToOne(() => LicensePhoto)
    @JoinColumn()
    license_photo: LicensePhoto;

    @Column({
        nullable: false
    })
    name: string;

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


    @OneToMany(() => Blog, (blog) => blog.office)
    blogs?: Blog[];


    @Column({
        type: 'enum',
        enum: OfficeCreatingStatus,
        default: OfficeCreatingStatus.pending,
    })
    status: OfficeCreatingStatus;

}
