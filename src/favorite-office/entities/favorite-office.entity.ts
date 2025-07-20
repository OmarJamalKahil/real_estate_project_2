import { Office } from 'src/office/entities/office.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';




@Entity()
export class FavoriteOffice {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.favoriteOffices,{eager:false})
    user: User;

    @ManyToOne(() => Office,{})
    office: Office;

}