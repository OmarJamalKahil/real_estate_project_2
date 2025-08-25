import { IsUUID } from "class-validator";
import { Office } from "src/office/entities/office.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OfficeComplaintPhoto } from "./office-complaint-photo.entity";
import { User } from "src/user/entities/user.entity";

@Entity()
export class OfficeComplaint{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Office, (office) => office.officeComplaints)
    @JoinColumn()
    office: Office;

    @ManyToOne(() => User, (user) => user.officeComplaints)
    @JoinColumn()
    user: User;

    @Column()
    content: string;

    @Column()
    date: Date;

    @Column()
    title: string;

    @OneToMany(() => OfficeComplaintPhoto, (officeComplaintPhoto) => officeComplaintPhoto.officeComplaint)
    officeComplaintPhotos: OfficeComplaintPhoto[];
}