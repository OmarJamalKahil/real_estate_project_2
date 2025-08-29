import { EnumStatus } from "src/property/common/property-status.enum";
import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";
import { Property } from "src/property/entities/property.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserProperty{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'date',
        default: new Date
    })
    date: Date;

    @Column({
        type: 'enum',
        enum: PropertyTypeOperation
    })
    type: PropertyTypeOperation;
  @ManyToOne(() => User, (user) => user.userProperties, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Property, (property) => property.userProperties, { onDelete: 'CASCADE' })
  property: Property;
}