



import { Office } from "src/office/entities/office.entity";
import { Property } from "src/property/entities/property.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";







@Entity()
export class PropertyComment {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        nullable: false
    })
    content: string;

    @ManyToOne(() => Property, (property) => property.comments)
    property: Property;


    @ManyToOne(() => User, (user) => user.comments)
    user: User;

}
