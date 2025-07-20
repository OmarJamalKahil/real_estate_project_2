
import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class FavoriteProperty {


    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.favoriteProperties, { eager: false })
    user: User;

    @ManyToOne(() => Property, {})
    property: Property;


}






