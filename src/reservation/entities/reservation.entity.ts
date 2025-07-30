import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm'; // Added CreateDateColumn

@Entity()
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.reservations) // Added inverse side (assuming User has a reservation property)
    @JoinColumn() // This side owns the relationship and will have the foreign key (user_id)
    user: User;

    @OneToOne(() => Property, property => property.reservation) // Added inverse side (assuming Property has a reservation property)
    @JoinColumn() // This side owns the relationship and will have the foreign key (property_id)
    property: Property;

    @Column({
        type: 'date' // Or 'timestamp'/'timestamptz' if you need time as well
    })
    reservation_date: Date;

    @Column({
        type: 'numeric' // Use 'decimal' or 'float' for currency, 'numeric' is fine but consider precision
    })
    amount_paid: number;

    @Column({
        type: 'boolean',
        default: false, // Initial state should be false
    })
    reservation_status: boolean;

    @Column({
        type: 'timestamp', // Use timestamp to include time for expiration
        default: () => { // Use a function for dynamic default values
            const date = new Date();
            date.setDate(date.getDate() + 3); // Add 3 days
            return `'${date.toISOString()}'`; // Return as string for database default
        },
        // IMPORTANT: The default can only be set ONCE when the record is created.
        // For existing records, this default won't apply.
        // For a more robust solution, set this value in your service layer when creating a reservation.
    })
    expires_at: Date;

    // This column will be updated by an external process/trigger
    @Column({
        type: 'boolean',
        default: false, // Initial state should be false
    })
    is_expired: boolean;

    @CreateDateColumn({ // Use @CreateDateColumn for automatic creation timestamp
        type: 'timestamp',
    })
    created_at: Date;

    // Optional: Add a method to check expiry in your application layer
    isExpired(): boolean {
        return new Date() > this.expires_at;
    }
}