import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Upload } from './upload.entity';
import { Banned } from './banned.entity';
import {  Warning } from './warning.entity';
import { UserWarnings } from './user-warnings.entity';

export enum Role {
    USER = 'user',
    OFFICEMANAGER = 'officeManager',
    ADMIN = 'admin',
    SUPERADMIN = 'superAdmin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column(
        {
            nullable: true
        }
    )
    first_name: string;

    @Column({
        nullable: true
    })
    last_name: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false, unique: true })
    phone: string;

    @Column({ nullable: true })
    password: string;

    @Column(
        { nullable: true }
    )
    verify_code: string;

    @Column({
        nullable: false,
        default: false
    })
    is_verified: boolean

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Column({ nullable: true })
    receiver_identifier: string;

    @OneToOne(() => Upload, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    profile_photo?: Upload;

    @OneToOne(() => Banned, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    banned: Banned;


    @OneToOne(() => UserWarnings, userWarnings => userWarnings.user, { cascade: true, eager: true })
    @JoinColumn()
    userWarnings: UserWarnings;


} 
