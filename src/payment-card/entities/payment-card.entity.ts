

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity'; // Adjust path to your User entity

export enum PaymentCardType {
    PAYPAL = 'paypal',
    VISA = 'visa',
    MASTERCARD = 'mastercard',
    APPLE_PAY = 'apple_pay',
    GOOGLE_PAY = 'google_pay',
}

@Entity()
export class PaymentCard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: PaymentCardType,
    })
    type: PaymentCardType;

    @Column({ unique: true })
    cardNumber: string;

    @Column({ nullable: true })
    expiryMonth: number;

    @Column({ nullable: true })
    expiryYear: number;

    @Column({ nullable: true })
    cvv: number;

    // @Column({ nullable: false, default: 0, type: 'numeric' })
    // money: number ;

    @Column('decimal', { precision: 10, scale: 2 })
    money: number;


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
