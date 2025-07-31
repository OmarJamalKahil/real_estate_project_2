import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Office } from "src/office/entities/office.entity";
import { BlogMedia } from "./blog_media.entity";

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

    @OneToOne(() => BlogMedia, { nullable: true,eager:true })
    @JoinColumn()
    blog_media?: BlogMedia;
}
