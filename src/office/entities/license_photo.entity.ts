import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class LicensePhoto {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column()
    public_id: string;
}