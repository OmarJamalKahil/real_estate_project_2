import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Office } from "./office.entity";




@Entity()
@Unique('unique_user_office_rating', ['user', 'office'])

export class OfficeRating {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.ratings, { nullable: false })
    user: User;

    @ManyToOne(() => Office, (office) => office.ratings, {nullable: false})
    office: Office;

    @Column({
        nullable: false
    })
    rating: number;

}