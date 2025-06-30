import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Office } from "src/office/entities/office.entity";

@Entity()
export class Blog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', nullable: false })
    title: string;

    @Column({ type: 'text', nullable: false })
    content: string;

    @ManyToOne(() => Office, (office) => office.blogs)
    office: Office;
}
