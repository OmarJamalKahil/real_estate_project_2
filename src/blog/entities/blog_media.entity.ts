import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blog } from "./blog.entity";




@Entity()
export class BlogMedia {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column()
    public_id: string;

    @OneToOne(() => Blog)
    @JoinColumn()
    blog: Blog;
}