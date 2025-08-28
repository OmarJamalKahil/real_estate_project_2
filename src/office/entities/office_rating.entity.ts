import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Office } from "./office.entity";




@Entity()
export class OfficeRating {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.ratings, { nullable: false })
    user: User;

    @ManyToOne(() => Office, (office) => office.ratings)
    office: Office;

    @Column({
        nullable: false,
        type:'numeric',
        precision: 2,
        scale: 1,
        default: '0'
    })
    number_of_stars: number;

}