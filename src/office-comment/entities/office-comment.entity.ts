import { Office } from "src/office/entities/office.entity";
import { OfficeRating } from "src/office/entities/office_rating.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";







@Entity()
export class OfficeComment {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        nullable: false
    })
    content: string;

    @ManyToOne(() => Office, (office) => office.comments)
    office: Office;


    @ManyToOne(() => User,(user)=> user.comments,{onDelete:'CASCADE'})
    user: User;

    // these are new
    @Column({
        type: 'date',
        nullable: false
    }) 
    date: Date;
 
    @OneToOne(() => OfficeRating, {nullable : true})
    @JoinColumn()
    rate: OfficeRating;
}
