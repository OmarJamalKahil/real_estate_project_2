import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OfficePhoto {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column()
    public_id: string;
}