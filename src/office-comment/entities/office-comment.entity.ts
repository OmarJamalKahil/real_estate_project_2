import { Office } from "src/office/entities/office.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";







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

}
